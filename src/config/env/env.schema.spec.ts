import { validateEnv } from './env.schema';

const inputApiPort = '4000';
const expectedApiPort = 4000;
const inputPostgresPort = '5432';
const expectedPostgresPort = 5432;
const defaultAccessTokenTtlSeconds = 900;
const defaultMagicLinkTtlSeconds = 900;

describe('validateEnv', () => {
  it('coerces env values and applies defaults', () => {
    const env = validateEnv({
      APP_ENV: 'staging',
      APP_VERSION: '1.2.3',
      CORS_ALLOWED_ORIGINS: 'https://app.sandicts.com',
      DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: inputPostgresPort,
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'sandicts',
      POSTGRES_DB: 'sandicts',
      PORT: inputApiPort,
      LOG_PRETTY: 'false',
      DOCS_ENABLED: 'true',
      EMAIL_DELIVERY_PROVIDER: 'resend',
      EMAIL_FROM_ADDRESS: 'auth@sandicts.com',
      RESEND_API_KEY: 'resend-api-key',
      WEB_APP_BASE_URL: 'https://app.sandicts.com',
    });

    expect(env.NODE_ENV).toBe('development');
    expect(env.APP_ENV).toBe('staging');
    expect(env.APP_VERSION).toBe('1.2.3');
    expect(env.PORT).toBe(expectedApiPort);
    expect(env.POSTGRES_PORT).toBe(expectedPostgresPort);
    expect(env.LOG_PRETTY).toBe(false);
    expect(env.DOCS_ENABLED).toBe(true);
    expect(env.APP_HOST).toBe('0.0.0.0');
    expect(env.DOCS_PATH).toBe('docs');
    expect(env.AUTH_ACCESS_TOKEN_TTL_SECONDS).toBe(
      defaultAccessTokenTtlSeconds,
    );
    expect(env.AUTH_GOOGLE_CLIENT_ID).toBeUndefined();
    expect(env.AUTH_MAGIC_LINK_TTL_SECONDS).toBe(defaultMagicLinkTtlSeconds);
    expect(env.AUTH_REFRESH_TOKEN_COOKIE_PATH).toBe('/auth/refresh');
  });

  it('requires production auth secrets and provider client ids', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
        CORS_ALLOWED_ORIGINS: 'https://app.sandicts.com',
        NODE_ENV: 'production',
        POSTGRES_DB: 'sandicts',
        POSTGRES_HOST: 'localhost',
        POSTGRES_PASSWORD: 'sandicts',
        POSTGRES_PORT: inputPostgresPort,
        POSTGRES_USER: 'postgres',
        EMAIL_DELIVERY_PROVIDER: 'resend',
        EMAIL_FROM_ADDRESS: 'auth@sandicts.com',
        RESEND_API_KEY: 'resend-api-key',
        WEB_APP_BASE_URL: 'https://app.sandicts.com',
      }),
    ).toThrow('Invalid environment variables');

    expect(() =>
      validateEnv({
        AUTH_ACCESS_TOKEN_SECRET: 'production-secret-with-enough-length',
        AUTH_GOOGLE_CLIENT_ID:
          'google-web-client-id.apps.googleusercontent.com',
        CORS_ALLOWED_ORIGINS: 'https://app.sandicts.com',
        DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
        NODE_ENV: 'production',
        POSTGRES_DB: 'sandicts',
        POSTGRES_HOST: 'localhost',
        POSTGRES_PASSWORD: 'sandicts',
        POSTGRES_PORT: inputPostgresPort,
        POSTGRES_USER: 'postgres',
        EMAIL_DELIVERY_PROVIDER: 'resend',
        EMAIL_FROM_ADDRESS: 'auth@sandicts.com',
        RESEND_API_KEY: 'resend-api-key',
        WEB_APP_BASE_URL: 'https://app.sandicts.com',
      }),
    ).not.toThrow();
  });

  it('validates provider-specific email configuration', () => {
    const baseEnv = {
      APP_ENV: 'staging',
      CORS_ALLOWED_ORIGINS: 'https://app.sandicts.com',
      DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
      POSTGRES_DB: 'sandicts',
      POSTGRES_HOST: 'localhost',
      POSTGRES_PASSWORD: 'sandicts',
      POSTGRES_PORT: inputPostgresPort,
      POSTGRES_USER: 'postgres',
    };

    expect(() =>
      validateEnv({
        ...baseEnv,
        EMAIL_DELIVERY_PROVIDER: 'smtp',
      }),
    ).toThrow('EMAIL_DELIVERY_PROVIDER');

    expect(() =>
      validateEnv({
        ...baseEnv,
        EMAIL_DELIVERY_PROVIDER: 'resend',
        EMAIL_FROM_ADDRESS: 'auth@sandicts.com',
        RESEND_API_KEY: 'resend-api-key',
        WEB_APP_BASE_URL: 'http://app.sandicts.com',
      }),
    ).toThrow('WEB_APP_BASE_URL');
  });

  it('throws when required env vars are invalid', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: 'not-a-url',
        POSTGRES_HOST: '',
        POSTGRES_PORT: 'abc',
        POSTGRES_USER: '',
        POSTGRES_PASSWORD: '',
        POSTGRES_DB: '',
      }),
    ).toThrow('Invalid environment variables');
  });

  it('rejects unsafe CORS and cookie configuration', () => {
    const baseEnv = {
      DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
      POSTGRES_DB: 'sandicts',
      POSTGRES_HOST: 'localhost',
      POSTGRES_PASSWORD: 'sandicts',
      POSTGRES_USER: 'postgres',
    };

    expect(() =>
      validateEnv({
        ...baseEnv,
        CORS_ALLOWED_ORIGINS: 'https://sandicts.com/path',
      }),
    ).toThrow('CORS_ALLOWED_ORIGINS');

    expect(() =>
      validateEnv({
        ...baseEnv,
        AUTH_COOKIE_SAME_SITE: 'none',
        AUTH_COOKIE_SECURE: 'false',
      }),
    ).toThrow('AUTH_COOKIE_SECURE');

    expect(() =>
      validateEnv({
        ...baseEnv,
        CORS_VERCEL_PREVIEW_PROJECT_SLUG: 'reactjs-sandicts-web',
      }),
    ).toThrow('configured together');
  });

  it('keeps the deployed web origin aligned with credentialed CORS', () => {
    expect(() =>
      validateEnv({
        APP_ENV: 'staging',
        CORS_ALLOWED_ORIGINS: 'https://other.sandicts.com.br',
        DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
        EMAIL_DELIVERY_PROVIDER: 'resend',
        EMAIL_FROM_ADDRESS: 'auth@sandicts.com.br',
        POSTGRES_DB: 'sandicts',
        POSTGRES_HOST: 'localhost',
        POSTGRES_PASSWORD: 'sandicts',
        POSTGRES_USER: 'postgres',
        RESEND_API_KEY: 'resend-api-key',
        WEB_APP_BASE_URL: 'https://preview.sandicts.com.br',
      }),
    ).toThrow('Must include WEB_APP_BASE_URL');

    expect(() =>
      validateEnv({
        APP_ENV: 'staging',
        CORS_ALLOWED_ORIGINS: 'https://localhost:3001',
        DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
        EMAIL_DELIVERY_PROVIDER: 'resend',
        EMAIL_FROM_ADDRESS: 'auth@sandicts.com.br',
        POSTGRES_DB: 'sandicts',
        POSTGRES_HOST: 'localhost',
        POSTGRES_PASSWORD: 'sandicts',
        POSTGRES_USER: 'postgres',
        RESEND_API_KEY: 'resend-api-key',
        WEB_APP_BASE_URL: 'https://localhost:3001',
      }),
    ).toThrow('non-local hostname');
  });

  it('keeps Vercel pull request origins out of production', () => {
    expect(() =>
      validateEnv({
        AUTH_ACCESS_TOKEN_SECRET: 'production-secret-with-enough-length',
        AUTH_GOOGLE_CLIENT_ID:
          'google-web-client-id.apps.googleusercontent.com',
        CORS_ALLOWED_ORIGINS: 'https://sandicts.com.br',
        CORS_VERCEL_PREVIEW_PROJECT_SLUG: 'reactjs-sandicts-web',
        CORS_VERCEL_PREVIEW_TEAM_SLUG: 'sandicts',
        DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
        EMAIL_DELIVERY_PROVIDER: 'resend',
        EMAIL_FROM_ADDRESS: 'auth@sandicts.com.br',
        NODE_ENV: 'production',
        POSTGRES_DB: 'sandicts',
        POSTGRES_HOST: 'localhost',
        POSTGRES_PASSWORD: 'sandicts',
        POSTGRES_USER: 'postgres',
        RESEND_API_KEY: 'resend-api-key',
        WEB_APP_BASE_URL: 'https://sandicts.com.br',
      }),
    ).toThrow('not allowed in production');
  });
});
