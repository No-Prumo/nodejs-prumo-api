import { validateEnv } from '../env/env.schema';
import { buildAuthConfig } from './auth.config';

const baseEnv = {
  DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
  POSTGRES_DB: 'sandicts',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PASSWORD: 'sandicts',
  POSTGRES_USER: 'postgres',
};

describe('buildAuthConfig', () => {
  it('uses a non-secure host-only-compatible cookie locally', () => {
    expect(
      buildAuthConfig(validateEnv(baseEnv)).refreshTokenCookie,
    ).toMatchObject({
      httpOnly: true,
      path: '/auth/refresh',
      sameSite: 'lax',
      secure: false,
    });
  });

  it('enables Secure from the deployment environment in staging', () => {
    const env = validateEnv({
      ...baseEnv,
      APP_ENV: 'staging',
      CORS_ALLOWED_ORIGINS: 'https://preview.sandicts.com.br',
      EMAIL_DELIVERY_PROVIDER: 'resend',
      EMAIL_FROM_ADDRESS: 'auth@sandicts.com.br',
      RESEND_API_KEY: 'resend-api-key',
      WEB_APP_BASE_URL: 'https://preview.sandicts.com.br',
    });

    expect(buildAuthConfig(env).refreshTokenCookie.secure).toBe(true);
  });
});
