import { NestExpressApplication } from '@nestjs/platform-express';
import type { CorsConfig } from '../config';

function setupCors(app: NestExpressApplication, settings: CorsConfig) {
  app.enableCors({
    allowedHeaders: [...settings.allowedHeaders],
    credentials: settings.credentials,
    methods: [...settings.allowedMethods],
    origin(origin, callback) {
      callback(null, isCorsOriginAllowed(origin, settings));
    },
  });
}

function isCorsOriginAllowed(origin: string | undefined, settings: CorsConfig) {
  if (origin === undefined) {
    return true;
  }

  let url: URL;

  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  if (
    url.origin !== origin ||
    !['http:', 'https:'].includes(url.protocol) ||
    url.username.length > 0 ||
    url.password.length > 0
  ) {
    return false;
  }

  if (settings.allowedOrigins.includes(url.origin)) {
    return true;
  }

  return isAllowedVercelPreview(url, settings.vercelPreview);
}

function isAllowedVercelPreview(
  url: URL,
  preview: CorsConfig['vercelPreview'],
) {
  if (!preview || url.protocol !== 'https:' || url.port.length > 0) {
    return false;
  }

  const hostname = url.hostname.toLowerCase();
  const expectedPrefix = `${preview.projectSlug}-`;
  const expectedSuffix = `-${preview.teamSlug}.vercel.app`;

  return (
    hostname.startsWith(expectedPrefix) &&
    hostname.endsWith(expectedSuffix) &&
    hostname.length > expectedPrefix.length + expectedSuffix.length
  );
}

export { isCorsOriginAllowed, setupCors };
