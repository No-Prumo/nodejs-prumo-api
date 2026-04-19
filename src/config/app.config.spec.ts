import { buildAppConfig } from './app.config';
import { validateEnv } from './env.schema';

const baseEnv = {
  DATABASE_URL: 'postgresql://postgres:no-prumo@localhost:5432/no-prumo',
  POSTGRES_DB: 'no-prumo',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PASSWORD: 'no-prumo',
  POSTGRES_PORT: '5432',
  POSTGRES_USER: 'postgres',
};

describe('buildAppConfig', () => {
  it('keeps runtime and deployment environment semantics explicit', () => {
    const env = validateEnv({
      ...baseEnv,
      APP_ENV: 'staging',
      NODE_ENV: 'production',
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
