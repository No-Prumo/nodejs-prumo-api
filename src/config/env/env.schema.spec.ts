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
      DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: inputPostgresPort,
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'sandicts',
      POSTGRES_DB: 'sandicts',
      PORT: inputApiPort,
      LOG_PRETTY: 'false',
      DOCS_ENABLED: 'true',
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
        NODE_ENV: 'production',
        POSTGRES_DB: 'sandicts',
        POSTGRES_HOST: 'localhost',
        POSTGRES_PASSWORD: 'sandicts',
        POSTGRES_PORT: inputPostgresPort,
        POSTGRES_USER: 'postgres',
      }),
    ).toThrow('Invalid environment variables');

    expect(() =>
      validateEnv({
        AUTH_ACCESS_TOKEN_SECRET: 'production-secret-with-enough-length',
        AUTH_GOOGLE_CLIENT_ID:
          'google-web-client-id.apps.googleusercontent.com',
        DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
        NODE_ENV: 'production',
        POSTGRES_DB: 'sandicts',
        POSTGRES_HOST: 'localhost',
        POSTGRES_PASSWORD: 'sandicts',
        POSTGRES_PORT: inputPostgresPort,
        POSTGRES_USER: 'postgres',
      }),
    ).not.toThrow();
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
});
