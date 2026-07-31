import { buildAppConfig } from './app.config';
import { validateEnv } from '../env/env.schema';

const testPostgresPort = '5432';

const baseEnv = {
  DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
  POSTGRES_DB: 'sandicts',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PASSWORD: 'sandicts',
  POSTGRES_PORT: testPostgresPort,
  POSTGRES_USER: 'postgres',
};

describe('buildAppConfig', () => {
  it('keeps runtime and deployment environment semantics explicit', () => {
    const env = validateEnv({
      ...baseEnv,
      APP_ENV: 'staging',
      AUTH_ACCESS_TOKEN_SECRET: 'production-secret-with-enough-length',
      AUTH_GOOGLE_CLIENT_ID: 'google-web-client-id.apps.googleusercontent.com',
      CORS_ALLOWED_ORIGINS: 'https://app.sandicts.com',
      EMAIL_DELIVERY_PROVIDER: 'resend',
      EMAIL_FROM_ADDRESS: 'auth@sandicts.com',
      NODE_ENV: 'production',
      RESEND_API_KEY: 'resend-api-key',
      WEB_APP_BASE_URL: 'https://app.sandicts.com',
    });

    expect(buildAppConfig(env)).toMatchObject({
      environment: 'staging',
      isDevelopmentRuntime: false,
      isLocalEnvironment: false,
      isProductionEnvironment: false,
      isProductionRuntime: true,
      isStagingEnvironment: true,
      isTestEnvironment: false,
      isTestRuntime: false,
    });
  });

  it('derives local environment from development runtime when APP_ENV is omitted', () => {
    const env = validateEnv(baseEnv);

    expect(buildAppConfig(env)).toMatchObject({
      environment: 'local',
      isDevelopmentRuntime: true,
      isLocalEnvironment: true,
      isProductionEnvironment: false,
      isProductionRuntime: false,
      isStagingEnvironment: false,
      isTestEnvironment: false,
      isTestRuntime: false,
    });
  });
});
