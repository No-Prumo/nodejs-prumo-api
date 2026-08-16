import { appendFile } from 'node:fs/promises';

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function positiveIntegerFromEnvironment(name, fallback) {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

function redact(text, secrets) {
  return secrets.reduce(
    (sanitized, secret) => sanitized.replaceAll(secret, '[redacted]'),
    text,
  );
}

async function request(label, url, options, secrets) {
  try {
    return await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${label} request failed: ${redact(message, secrets)}`);
  }
}

async function responsePayload(response) {
  const body = await response.text();
  if (!body) {
    return null;
  }

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

function safeResponseDescription(payload, secrets) {
  if (payload === null) {
    return 'empty response body';
  }

  if (typeof payload === 'string') {
    return redact(payload, secrets).slice(0, 500);
  }

  return redact(JSON.stringify(payload), secrets).slice(0, 500);
}

async function renderApiRequest(path, apiKey, secrets) {
  const response = await request(
    'Render API',
    `https://api.render.com/v1${path}`,
    {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
    },
    secrets,
  );
  const payload = await responsePayload(response);

  if (!response.ok) {
    throw new Error(
      `Render API returned HTTP ${response.status}: ${safeResponseDescription(payload, secrets)}`,
    );
  }

  return payload;
}

async function findQueuedDeploy({
  serviceId,
  targetSha,
  triggeredAfter,
  apiKey,
  secrets,
  deadline,
  pollIntervalMs,
}) {
  console.log('Deploy was queued; waiting for Render to expose its deploy ID.');

  while (Date.now() < deadline) {
    const query = new URLSearchParams({
      createdAfter: triggeredAfter,
      limit: '20',
    });
    const entries = await renderApiRequest(
      `/services/${encodeURIComponent(serviceId)}/deploys?${query}`,
      apiKey,
      secrets,
    );
    const matchingDeploys = Array.isArray(entries)
      ? entries
          .map((entry) => entry?.deploy)
          .filter((deploy) => deploy?.commit?.id === targetSha)
          .sort((left, right) =>
            String(left.createdAt).localeCompare(String(right.createdAt)),
          )
      : [];
    const deploy = matchingDeploys.at(-1);

    if (deploy?.id) {
      return deploy.id;
    }

    await sleep(pollIntervalMs);
  }

  throw new Error('Timed out while discovering the queued Render deploy.');
}

async function triggerDeploy({
  hookUrl,
  targetSha,
  serviceId,
  apiKey,
  secrets,
  deadline,
  pollIntervalMs,
}) {
  const triggeredAfter = new Date(Date.now() - 30_000).toISOString();
  const url = new URL(hookUrl);
  url.searchParams.set('ref', targetSha);

  const response = await request(
    'Render deploy hook',
    url,
    {
      method: 'POST',
      redirect: 'follow',
    },
    secrets,
  );
  const payload = await responsePayload(response);

  if (response.status !== 200 && response.status !== 202) {
    throw new Error(
      `Render deploy hook returned HTTP ${response.status}: ${safeResponseDescription(payload, secrets)}`,
    );
  }

  const deployId = payload?.id ?? payload?.deploy?.id;
  if (deployId) {
    return deployId;
  }

  if (response.status === 202) {
    return findQueuedDeploy({
      serviceId,
      targetSha,
      triggeredAfter,
      apiKey,
      secrets,
      deadline,
      pollIntervalMs,
    });
  }

  throw new Error('Render deploy hook did not return a deploy ID.');
}

async function waitForDeploy({
  deployId,
  serviceId,
  targetSha,
  apiKey,
  secrets,
  deadline,
  pollIntervalMs,
}) {
  const failedStatuses = new Set([
    'build_failed',
    'update_failed',
    'pre_deploy_failed',
    'canceled',
    'deactivated',
  ]);
  let previousStatus = null;

  while (Date.now() < deadline) {
    const deploy = await renderApiRequest(
      `/services/${encodeURIComponent(serviceId)}/deploys/${encodeURIComponent(deployId)}`,
      apiKey,
      secrets,
    );
    const status = deploy?.status ?? 'unknown';

    if (status !== previousStatus) {
      console.log(`Render deploy ${deployId}: ${status}`);
      previousStatus = status;
    }

    if (failedStatuses.has(status)) {
      throw new Error(
        `Render deploy ${deployId} ended with status '${status}'.`,
      );
    }

    if (status === 'live') {
      if (deploy?.commit?.id !== targetSha) {
        throw new Error(
          `Render reported SHA '${deploy?.commit?.id ?? 'unknown'}' instead of '${targetSha}'.`,
        );
      }

      return deploy;
    }

    await sleep(pollIntervalMs);
  }

  throw new Error(`Timed out while waiting for Render deploy ${deployId}.`);
}

async function waitForEndpoint({
  baseUrl,
  path,
  label,
  deadline,
  pollIntervalMs,
  secrets,
}) {
  const url = new URL(path, `${baseUrl}/`);
  let lastStatus = 'no response';

  while (Date.now() < deadline) {
    try {
      const response = await request(
        label,
        url,
        {
          headers: { accept: 'application/json' },
          redirect: 'follow',
        },
        secrets,
      );
      lastStatus = `HTTP ${response.status}`;

      if (response.status >= 200 && response.status < 400) {
        console.log(`${label} passed (${lastStatus}).`);
        return;
      }
    } catch (error) {
      lastStatus = error instanceof Error ? error.message : String(error);
    }

    console.log(`${label} is not ready yet (${lastStatus}).`);
    await sleep(pollIntervalMs);
  }

  throw new Error(`${label} timed out. Last result: ${lastStatus}`);
}

async function writeSummary({ targetSha, deployId, baseUrl }) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    return;
  }

  await appendFile(
    summaryPath,
    [
      '## Render deployment',
      '',
      `- Commit: \`${targetSha}\``,
      `- Deploy: \`${deployId}\``,
      `- API: ${baseUrl}`,
      '- Readiness: passed',
      '- Smoke test: passed',
      '',
    ].join('\n'),
  );
}

async function main() {
  const targetSha = requireEnvironment('TARGET_SHA').toLowerCase();
  const hookUrl = requireEnvironment('RENDER_DEPLOY_HOOK_URL');
  const apiKey = requireEnvironment('RENDER_API_KEY');
  const serviceId = requireEnvironment('RENDER_SERVICE_ID');
  const baseUrl = requireEnvironment('PREVIEW_API_BASE_URL').replace(/\/$/, '');
  const timeoutMs = positiveIntegerFromEnvironment(
    'RENDER_DEPLOY_TIMEOUT_MS',
    25 * 60 * 1_000,
  );
  const healthTimeoutMs = positiveIntegerFromEnvironment(
    'PREVIEW_HEALTH_TIMEOUT_MS',
    10 * 60 * 1_000,
  );
  const pollIntervalMs = positiveIntegerFromEnvironment(
    'RENDER_POLL_INTERVAL_MS',
    15_000,
  );
  const secrets = [hookUrl, apiKey];

  if (!/^[0-9a-f]{40}$/.test(targetSha)) {
    throw new Error('TARGET_SHA must be a full 40-character Git commit SHA.');
  }

  const previewUrl = new URL(baseUrl);
  if (
    previewUrl.protocol !== 'https:' ||
    previewUrl.username ||
    previewUrl.password ||
    previewUrl.pathname !== '/' ||
    previewUrl.search ||
    previewUrl.hash
  ) {
    throw new Error(
      'PREVIEW_API_BASE_URL must be an HTTPS origin without credentials, path, query, or hash.',
    );
  }

  const parsedHookUrl = new URL(hookUrl);
  if (
    parsedHookUrl.protocol !== 'https:' ||
    parsedHookUrl.hostname !== 'api.render.com'
  ) {
    throw new Error('RENDER_DEPLOY_HOOK_URL must be an HTTPS Render API URL.');
  }

  if (!/^srv-[a-z0-9]+$/.test(serviceId)) {
    throw new Error('RENDER_SERVICE_ID must be a Render service ID.');
  }

  const deployDeadline = Date.now() + timeoutMs;
  console.log(`Triggering Render deployment for ${targetSha}.`);
  const deployId = await triggerDeploy({
    hookUrl,
    targetSha,
    serviceId,
    apiKey,
    secrets,
    deadline: deployDeadline,
    pollIntervalMs,
  });
  console.log(`Tracking Render deploy ${deployId}.`);

  await waitForDeploy({
    deployId,
    serviceId,
    targetSha,
    apiKey,
    secrets,
    deadline: deployDeadline,
    pollIntervalMs,
  });

  const healthDeadline = Date.now() + healthTimeoutMs;
  await waitForEndpoint({
    baseUrl,
    path: '/health/ready',
    label: 'Preview readiness check',
    deadline: healthDeadline,
    pollIntervalMs,
    secrets,
  });
  await waitForEndpoint({
    baseUrl,
    path: '/health/live',
    label: 'Preview smoke test',
    deadline: healthDeadline,
    pollIntervalMs,
    secrets,
  });
  await writeSummary({ targetSha, deployId, baseUrl });
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Deployment failed: ${message}`);
  process.exitCode = 1;
});
