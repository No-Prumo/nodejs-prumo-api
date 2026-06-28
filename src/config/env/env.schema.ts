import { z } from 'zod';
import { secondsPerDay } from '@shared/time/time.constants';
import {
  appEnvironmentValues,
  nodeEnvironmentValues,
  resolveAppEnvironment,
} from '../app/app-environment';
import {
  emailDeliveryProviderValues,
  getDefaultEmailDeliveryProvider,
} from '../email/email-delivery-provider';
import { getPackageMetadata } from '../app/package-metadata';
import { loggerLevelInputValues } from '../logger/logger-level';

const packageMetadata = getPackageMetadata();
const minimumNonEmptyStringLength = 1;
const minimumAccessTokenSecretLength = 32;
const minimumPortNumber = 1;
const maximumPortNumber = 65535;
const defaultApiPort = 3000;
const defaultPostgresPort = 5432;
const defaultSmtpPort = 1025;
const defaultAccessTokenTtlSeconds = 900;
const defaultMagicLinkTtlSeconds = 900;
const refreshTokenIdleTtlDays = 14;
const refreshTokenAbsoluteTtlDays = 30;
const defaultRefreshTokenIdleTtlSeconds =
  secondsPerDay * refreshTokenIdleTtlDays;
const defaultRefreshTokenAbsoluteTtlSeconds =
  secondsPerDay * refreshTokenAbsoluteTtlDays;

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

const portFromEnv = z.coerce
  .number()
  .int()
  .min(minimumPortNumber)
  .max(maximumPortNumber);
const positiveSecondsFromEnv = z.coerce.number().int().positive();
const optionalStringFromEnv = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim().length === 0 ? undefined : value,
  z.string().trim().min(minimumNonEmptyStringLength).optional(),
);
const optionalEmailFromEnv = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim().length === 0 ? undefined : value,
  z.string().trim().email().optional(),
);

const envSchema = z
  .object({
    NODE_ENV: z.enum(nodeEnvironmentValues).default('development'),
    APP_ENV: z.enum(appEnvironmentValues).optional(),
    APP_VERSION: z.string().trim().min(minimumNonEmptyStringLength).optional(),
    PORT: portFromEnv.default(defaultApiPort),
    APP_HOST: z
      .string()
      .trim()
      .min(minimumNonEmptyStringLength)
      .default('0.0.0.0'),
    APP_GLOBAL_PREFIX: z.string().trim().default(''),
    DATABASE_URL: z.string().url(),
    POSTGRES_HOST: z.string().trim().min(minimumNonEmptyStringLength),
    POSTGRES_PORT: portFromEnv.default(defaultPostgresPort),
    POSTGRES_USER: z.string().trim().min(minimumNonEmptyStringLength),
    POSTGRES_PASSWORD: z.string().min(minimumNonEmptyStringLength),
    POSTGRES_DB: z.string().trim().min(minimumNonEmptyStringLength),
    LOG_LEVEL: z.enum(loggerLevelInputValues).optional(),
    LOG_PRETTY: booleanFromEnv.optional(),
    DOCS_ENABLED: booleanFromEnv.default(true),
    DOCS_PATH: z.string().trim().min(1).default('docs'),
    OBSERVABILITY_ENABLED: booleanFromEnv.default(false),
    OBSERVABILITY_SERVICE_NAME: z
      .string()
      .trim()
      .min(minimumNonEmptyStringLength)
      .default(packageMetadata.name),
    AUTH_ACCESS_TOKEN_SECRET: z
      .string()
      .trim()
      .min(minimumAccessTokenSecretLength)
      .optional(),
    AUTH_ACCESS_TOKEN_TTL_SECONDS: positiveSecondsFromEnv.default(
      defaultAccessTokenTtlSeconds,
    ),
    AUTH_GOOGLE_CLIENT_ID: z
      .string()
      .trim()
      .min(minimumNonEmptyStringLength)
      .optional(),
    AUTH_MAGIC_LINK_TTL_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(defaultMagicLinkTtlSeconds),
    AUTH_REFRESH_TOKEN_IDLE_TTL_SECONDS: positiveSecondsFromEnv.default(
      defaultRefreshTokenIdleTtlSeconds,
    ),
    AUTH_REFRESH_TOKEN_ABSOLUTE_TTL_SECONDS: positiveSecondsFromEnv.default(
      defaultRefreshTokenAbsoluteTtlSeconds,
    ),
    AUTH_REFRESH_TOKEN_COOKIE_NAME: z
      .string()
      .trim()
      .min(minimumNonEmptyStringLength)
      .default('sandicts_refresh_token'),
    AUTH_REFRESH_TOKEN_COOKIE_PATH: z
      .string()
      .trim()
      .min(minimumNonEmptyStringLength)
      .default('/auth/refresh'),
    AUTH_COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    AUTH_COOKIE_SECURE: booleanFromEnv.optional(),
    EMAIL_DELIVERY_PROVIDER: z.enum(emailDeliveryProviderValues).optional(),
    EMAIL_FROM_ADDRESS: optionalEmailFromEnv,
    EMAIL_FROM_NAME: z
      .string()
      .trim()
      .min(minimumNonEmptyStringLength)
      .default('Sandicts'),
    EMAIL_REPLY_TO_ADDRESS: optionalEmailFromEnv,
    WEB_APP_BASE_URL: optionalStringFromEnv.pipe(z.string().url().optional()),
    RESEND_API_KEY: optionalStringFromEnv,
    SMTP_HOST: optionalStringFromEnv,
    SMTP_PORT: portFromEnv.default(defaultSmtpPort),
    SMTP_SECURE: booleanFromEnv.default(false),
    SMTP_USER: optionalStringFromEnv,
    SMTP_PASSWORD: optionalStringFromEnv,
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

    if (
      env.NODE_ENV === 'production' &&
      env.AUTH_GOOGLE_CLIENT_ID === undefined
    ) {
      context.addIssue({
        code: 'custom',
        path: ['AUTH_GOOGLE_CLIENT_ID'],
        message: 'Required in production',
      });
    }

    const environment = resolveAppEnvironment(env);
    const emailProvider =
      env.EMAIL_DELIVERY_PROVIDER ??
      getDefaultEmailDeliveryProvider(environment);

    if (environment === 'local' && emailProvider !== 'smtp') {
      context.addIssue({
        code: 'custom',
        path: ['EMAIL_DELIVERY_PROVIDER'],
        message: 'Local environment must use smtp delivery',
      });
    }

    if (
      (environment === 'staging' || environment === 'production') &&
      emailProvider !== 'resend'
    ) {
      context.addIssue({
        code: 'custom',
        path: ['EMAIL_DELIVERY_PROVIDER'],
        message: 'Staging and production environments must use resend delivery',
      });
    }

    if (
      (environment === 'staging' || environment === 'production') &&
      env.EMAIL_DELIVERY_PROVIDER === undefined
    ) {
      context.addIssue({
        code: 'custom',
        path: ['EMAIL_DELIVERY_PROVIDER'],
        message: 'Required in staging and production',
      });
    }

    if (
      (environment === 'staging' || environment === 'production') &&
      env.EMAIL_FROM_ADDRESS === undefined
    ) {
      context.addIssue({
        code: 'custom',
        path: ['EMAIL_FROM_ADDRESS'],
        message: 'Required in staging and production',
      });
    }

    if (
      (environment === 'staging' || environment === 'production') &&
      env.WEB_APP_BASE_URL === undefined
    ) {
      context.addIssue({
        code: 'custom',
        path: ['WEB_APP_BASE_URL'],
        message: 'Required in staging and production',
      });
    }

    if (emailProvider === 'resend' && env.RESEND_API_KEY === undefined) {
      context.addIssue({
        code: 'custom',
        path: ['RESEND_API_KEY'],
        message: 'Required when EMAIL_DELIVERY_PROVIDER is resend',
      });
    }

    if (
      emailProvider === 'smtp' &&
      environment !== 'local' &&
      env.SMTP_HOST === undefined
    ) {
      context.addIssue({
        code: 'custom',
        path: ['SMTP_HOST'],
        message: 'Required when EMAIL_DELIVERY_PROVIDER is smtp',
      });
    }

    if ((env.SMTP_USER === undefined) !== (env.SMTP_PASSWORD === undefined)) {
      context.addIssue({
        code: 'custom',
        path: ['SMTP_USER'],
        message: 'SMTP_USER and SMTP_PASSWORD must be configured together',
      });
    }

    if (env.WEB_APP_BASE_URL !== undefined) {
      validateWebAppBaseUrl(env.WEB_APP_BASE_URL, environment, context);
    }
  });

function validateWebAppBaseUrl(
  value: string,
  environment: (typeof appEnvironmentValues)[number],
  context: z.RefinementCtx,
) {
  const url = new URL(value);
  const isSecureEnvironment =
    environment === 'staging' || environment === 'production';

  if (!['http:', 'https:'].includes(url.protocol)) {
    context.addIssue({
      code: 'custom',
      path: ['WEB_APP_BASE_URL'],
      message: 'Must use the http or https protocol',
    });
  }

  if (isSecureEnvironment && url.protocol !== 'https:') {
    context.addIssue({
      code: 'custom',
      path: ['WEB_APP_BASE_URL'],
      message: 'Must use https in staging and production',
    });
  }

  if (
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.pathname !== '/' ||
    url.search.length > 0 ||
    url.hash.length > 0
  ) {
    context.addIssue({
      code: 'custom',
      path: ['WEB_APP_BASE_URL'],
      message: 'Must be an origin without credentials, path, query, or hash',
    });
  }
}

type Env = z.infer<typeof envSchema>;

function validateEnv(env: Record<string, unknown>): Env {
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

function getEnv(env: Record<string, unknown> = process.env): Env {
  if (env === process.env && cachedEnv) {
    return cachedEnv;
  }

  const parsedEnv = validateEnv(env);

  if (env === process.env) {
    cachedEnv = parsedEnv;
  }

  return parsedEnv;
}

export { envSchema, getEnv, validateEnv };
export type { Env };
