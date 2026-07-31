function parseCorsAllowedOrigins(value: string) {
  const candidates = value
    .split(',')
    .map((candidate) => candidate.trim())
    .filter(Boolean);

  if (candidates.length === 0) {
    throw new Error('At least one CORS origin is required');
  }

  const origins = candidates.map(parseCorsOrigin);

  if (new Set(origins).size !== origins.length) {
    throw new Error('CORS origins must be unique');
  }

  return origins;
}

function parseCorsOrigin(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid CORS origin: ${value}`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`CORS origin must use HTTP or HTTPS: ${value}`);
  }

  if (
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.pathname !== '/' ||
    url.search.length > 0 ||
    url.hash.length > 0
  ) {
    throw new Error(
      `CORS origin must not include credentials, path, query, or hash: ${value}`,
    );
  }

  return url.origin;
}

function isLocalCorsHostname(hostname: string) {
  const normalizedHostname = hostname.toLowerCase().replace(/^\[|\]$/g, '');

  return (
    normalizedHostname === 'localhost' ||
    normalizedHostname.endsWith('.localhost') ||
    normalizedHostname === '::1' ||
    normalizedHostname === '0.0.0.0' ||
    normalizedHostname.startsWith('127.')
  );
}

export { isLocalCorsHostname, parseCorsAllowedOrigins, parseCorsOrigin };
