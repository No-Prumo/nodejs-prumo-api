import { z } from 'zod';

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

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: portFromEnv.default(3000),
  APP_HOST: z.string().trim().min(1).default('0.0.0.0'),
  APP_GLOBAL_PREFIX: z.string().trim().default(''),
  DATABASE_URL: z.string().url(),
  POSTGRES_HOST: z.string().trim().min(1),
  POSTGRES_PORT: portFromEnv.default(5432),
  POSTGRES_USER: z.string().trim().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().trim().min(1),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'log', 'debug', 'verbose'])
    .default('log'),
  LOG_PRETTY: booleanFromEnv.default(true),
  DOCS_ENABLED: booleanFromEnv.default(true),
  DOCS_PATH: z.string().trim().min(1).default('docs'),
  OBSERVABILITY_ENABLED: booleanFromEnv.default(false),
  OBSERVABILITY_SERVICE_NAME: z
    .string()
    .trim()
    .min(1)
    .default('nodejs-prumo-api'),
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
