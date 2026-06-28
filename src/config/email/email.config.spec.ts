import { buildEmailConfig } from './email.config';
import { validateEnv } from '../env/env.schema';

const baseEnv = {
  DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
  POSTGRES_DB: 'sandicts',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PASSWORD: 'sandicts',
  POSTGRES_PORT: '5432',
  POSTGRES_USER: 'postgres',
};

describe('buildEmailConfig', () => {
  it('uses Mailpit-compatible SMTP defaults locally', () => {
    const settings = buildEmailConfig(validateEnv(baseEnv));

    expect(settings).toMatchObject({
      provider: 'smtp',
      fromAddress: 'auth@sandicts.test',
      fromName: 'Sandicts',
      webAppBaseUrl: 'http://localhost:3001',
      host: 'localhost',
      port: 1025,
      secure: false,
    });
  });

  it('uses the in-memory provider in unit test environments', () => {
    const settings = buildEmailConfig(
      validateEnv({
        ...baseEnv,
        APP_ENV: 'test',
      }),
    );

    expect(settings.provider).toBe('development');
  });

  it('maps validated Resend configuration', () => {
    const settings = buildEmailConfig(
      validateEnv({
        ...baseEnv,
        APP_ENV: 'staging',
        EMAIL_DELIVERY_PROVIDER: 'resend',
        EMAIL_FROM_ADDRESS: 'auth@sandicts.com',
        EMAIL_REPLY_TO_ADDRESS: 'support@sandicts.com',
        RESEND_API_KEY: 'resend-api-key',
        WEB_APP_BASE_URL: 'https://app.sandicts.com',
      }),
    );

    expect(settings).toEqual({
      provider: 'resend',
      apiKey: 'resend-api-key',
      fromAddress: 'auth@sandicts.com',
      fromName: 'Sandicts',
      replyToAddress: 'support@sandicts.com',
      webAppBaseUrl: 'https://app.sandicts.com',
    });
  });
});
