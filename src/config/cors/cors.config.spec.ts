import { validateEnv } from '../env/env.schema';
import { buildCorsConfig } from './cors.config';

const baseEnv = {
  DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
  POSTGRES_DB: 'sandicts',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PASSWORD: 'sandicts',
  POSTGRES_USER: 'postgres',
};

describe('buildCorsConfig', () => {
  it('uses an exact local origin and credentialed browser requests by default', () => {
    expect(buildCorsConfig(validateEnv(baseEnv))).toEqual({
      allowedHeaders: ['Accept', 'Authorization', 'Content-Type'],
      allowedMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedOrigins: ['http://localhost:3001'],
      credentials: true,
      vercelPreview: null,
    });
  });

  it('normalizes exact origins and configures a scoped Vercel preview project', () => {
    const env = validateEnv({
      ...baseEnv,
      CORS_ALLOWED_ORIGINS:
        'https://preview.sandicts.com.br/, https://admin.preview.sandicts.com.br',
      CORS_VERCEL_PREVIEW_PROJECT_SLUG: 'reactjs-sandicts-web',
      CORS_VERCEL_PREVIEW_TEAM_SLUG: 'sandicts',
    });

    expect(buildCorsConfig(env)).toMatchObject({
      allowedOrigins: [
        'https://preview.sandicts.com.br',
        'https://admin.preview.sandicts.com.br',
      ],
      vercelPreview: {
        projectSlug: 'reactjs-sandicts-web',
        teamSlug: 'sandicts',
      },
    });
  });
});
