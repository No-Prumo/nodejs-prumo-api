import { buildAuthConfig, validateEnv } from '@config';
import type { BuildTestAuthConfigOverrides } from './build-test-auth-config.types';

function buildTestAuthConfig(overrides: BuildTestAuthConfigOverrides = {}) {
  return buildAuthConfig(
    validateEnv({
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

export { buildTestAuthConfig };
