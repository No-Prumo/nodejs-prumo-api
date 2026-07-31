import { ConfigType, registerAs } from '@nestjs/config';
import type { Env } from '../env/env.schema';
import { getEnv } from '../env/env.schema';
import { parseCorsAllowedOrigins } from './cors-origin';

const allowedHeaders = ['Accept', 'Authorization', 'Content-Type'] as const;
const allowedMethods = ['GET', 'POST', 'PATCH', 'OPTIONS'] as const;

function buildCorsConfig(env: Env) {
  const vercelPreview =
    env.CORS_VERCEL_PREVIEW_PROJECT_SLUG && env.CORS_VERCEL_PREVIEW_TEAM_SLUG
      ? {
          projectSlug: env.CORS_VERCEL_PREVIEW_PROJECT_SLUG,
          teamSlug: env.CORS_VERCEL_PREVIEW_TEAM_SLUG,
        }
      : null;

  return {
    allowedHeaders,
    allowedMethods,
    allowedOrigins: parseCorsAllowedOrigins(env.CORS_ALLOWED_ORIGINS),
    credentials: true,
    vercelPreview,
  };
}

const corsConfig = registerAs('cors', () => buildCorsConfig(getEnv()));

type CorsConfig = ConfigType<typeof corsConfig>;

export { buildCorsConfig, corsConfig };
export type { CorsConfig };
