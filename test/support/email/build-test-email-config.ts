import { buildEmailConfig, validateEnv } from '@config';
import type { BuildTestEmailConfigOverrides } from './build-test-email-config.types';

function buildTestEmailConfig(overrides: BuildTestEmailConfigOverrides = {}) {
  return buildEmailConfig(
    validateEnv({
      APP_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
      POSTGRES_DB: 'sandicts',
      POSTGRES_HOST: 'localhost',
      POSTGRES_PASSWORD: 'sandicts',
      POSTGRES_PORT: '5432',
      POSTGRES_USER: 'postgres',
      ...overrides,
    }),
  );
}

export { buildTestEmailConfig };
