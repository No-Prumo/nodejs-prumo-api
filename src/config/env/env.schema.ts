import { z } from 'zod';
import {
  appEnvironmentValues,
  nodeEnvironmentValues,
} from '../app/app-environment';
import { getPackageMetadata } from '../app/package-metadata';
import { loggerLevelInputValues } from '../logger/logger-level';

const packageMetadata = getPackageMetadata();

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim().toLowerCase();

  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return value;
}, z.boolean());

const portFromEnv = z.coerce.number().int().min(1).max(65535);
const positiveSecondsFromEnv = z.coerce.number().int().positive();

export const envSchema = z
  .object({
    NODE_ENV: z.enum(nodeEnvironmentValues).default('development'),
    APP_ENV: z.enum(appEnvironmentValues).optional(),
    APP_VERSION: z.string().trim().min(1).optional(),
    PORT: portFromEnv.default(3000),
    APP_HOST: z.string().trim().min(1).default('0.0.0.0'),
    APP_GLOBAL_PREFIX: z.string().trim().default(''),
    DATABASE_URL: z.string().url(),
    POSTGRES_HOST: z.string().trim().min(1),
    POSTGRES_PORT: portFromEnv.default(5432),
    POSTGRES_USER: z.string().trim().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DB: z.string().trim().min(1),
    LOG_LEVEL: z.enum(loggerLevelInputValues).optional(),
    LOG_PRETTY: booleanFromEnv.optional(),
    DOCS_ENABLED: booleanFromEnv.default(true),
    DOCS_PATH: z.string().trim().min(1).default('docs'),
    OBSERVABILITY_ENABLED: booleanFromEnv.default(false),
    OBSERVABILITY_SERVICE_NAME: z
      .string()
      .trim()
      .min(1)
      .default(packageMetadata.name),
    AUTH_ACCESS_TOKEN_SECRET: z.string().trim().min(32).optional(),
    AUTH_ACCESS_TOKEN_TTL_SECONDS: positiveSecondsFromEnv.default(900),
    AUTH_REFRESH_TOKEN_IDLE_TTL_SECONDS: positiveSecondsFromEnv.default(
      60 * 60 * 24 * 14,
    ),
    AUTH_REFRESH_TOKEN_ABSOLUTE_TTL_SECONDS: positiveSecondsFromEnv.default(
      60 * 60 * 24 * 30,
    ),
    AUTH_REFRESH_TOKEN_COOKIE_NAME: z
      .string()
      .trim()
      .min(1)
      .default('sandicts_refresh_token'),
    AUTH_REFRESH_TOKEN_COOKIE_PATH: z
      .string()
      .trim()
      .min(1)
      .default('/auth/refresh'),
    AUTH_COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    AUTH_COOKIE_SECURE: booleanFromEnv.optional(),
  })
  .superRefine((env, context) => {
    if (
      env.NODE_ENV === 'production' &&
      env.AUTH_ACCESS_TOKEN_SECRET === undefined
    ) {
      context.addIssue({
        code: 'custom',
        path: ['AUTH_ACCESS_TOKEN_SECRET'],
        message: 'Required in production',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: Record<string, unknown>): Env {
  const parsedEnv = envSchema.safeParse(env);

  if (parsedEnv.success) {
    return parsedEnv.data;
  }

  const details = parsedEnv.error.issues
    .map(({ path, message }) => `${path.join('.')}: ${message}`)
    .join(', ');

  throw new Error(`Invalid environment variables: ${details}`);
}

let cachedEnv: Env | undefined;

export function getEnv(env: Record<string, unknown> = process.env): Env {
  if (env === process.env && cachedEnv) {
    return cachedEnv;
  }

  const parsedEnv = validateEnv(env);

  if (env === process.env) {
    cachedEnv = parsedEnv;
  }

  return parsedEnv;
}
