import { validateEnv } from '../env/env.schema';
import { buildLoggerConfig } from './logger.config';

const testPostgresPort = '5432';

const baseEnv = {
  DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
  POSTGRES_DB: 'sandicts',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PASSWORD: 'sandicts',
  POSTGRES_PORT: testPostgresPort,
  POSTGRES_USER: 'postgres',
};

describe('buildLoggerConfig', () => {
  it('defaults to pretty debug logs in local development', () => {
    const env = validateEnv(baseEnv);

    expect(buildLoggerConfig(env)).toEqual({
      level: 'debug',
      pretty: true,
    });
  });

  it('defaults to JSON info logs in staging', () => {
    const env = validateEnv({
      ...baseEnv,
      APP_ENV: 'staging',
      AUTH_ACCESS_TOKEN_SECRET: 'production-secret-with-enough-length',
      AUTH_GOOGLE_CLIENT_ID: 'google-web-client-id.apps.googleusercontent.com',
      EMAIL_DELIVERY_PROVIDER: 'resend',
      EMAIL_FROM_ADDRESS: 'auth@sandicts.com',
      NODE_ENV: 'production',
      RESEND_API_KEY: 'resend-api-key',
      WEB_APP_BASE_URL: 'https://app.sandicts.com',
    });

    expect(buildLoggerConfig(env)).toEqual({
      level: 'info',
      pretty: false,
    });
  });

  it('normalizes Nest logger aliases to native pino levels', () => {
    const env = validateEnv({
      ...baseEnv,
      LOG_LEVEL: 'verbose',
      LOG_PRETTY: 'false',
    });

    expect(buildLoggerConfig(env)).toEqual({
      level: 'trace',
      pretty: false,
    });
  });
});
