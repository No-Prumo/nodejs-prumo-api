import { validateEnv } from '../config';
import { buildCorsConfig } from '../config/cors/cors.config';
import { isCorsOriginAllowed } from './setup-cors';

const baseEnv = {
  CORS_ALLOWED_ORIGINS: 'https://preview.sandicts.com.br',
  CORS_VERCEL_PREVIEW_PROJECT_SLUG: 'reactjs-sandicts-web',
  CORS_VERCEL_PREVIEW_TEAM_SLUG: 'sandicts',
  DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
  POSTGRES_DB: 'sandicts',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PASSWORD: 'sandicts',
  POSTGRES_USER: 'postgres',
};

const settings = buildCorsConfig(validateEnv(baseEnv));

describe('isCorsOriginAllowed', () => {
  it('allows non-browser requests and exact configured origins', () => {
    expect(isCorsOriginAllowed(undefined, settings)).toBe(true);
    expect(
      isCorsOriginAllowed('https://preview.sandicts.com.br', settings),
    ).toBe(true);
  });

  it('allows only HTTPS previews owned by the configured project and team', () => {
    expect(
      isCorsOriginAllowed(
        'https://reactjs-sandicts-web-git-kan-64-sandicts.vercel.app',
        settings,
      ),
    ).toBe(true);
    expect(
      isCorsOriginAllowed(
        'https://reactjs-sandicts-web-a1b2c3-sandicts.vercel.app',
        settings,
      ),
    ).toBe(true);
  });

  it.each([
    'http://reactjs-sandicts-web-git-kan-64-sandicts.vercel.app',
    'https://reactjs-sandicts-web-git-kan-64-attacker.vercel.app',
    'https://evil-reactjs-sandicts-web-git-kan-64-sandicts.vercel.app',
    'https://preview.sandicts.com.br.evil.example',
    'https://preview.sandicts.com.br/',
    'null',
  ])('rejects an unknown or malformed browser origin: %s', (origin) => {
    expect(isCorsOriginAllowed(origin, settings)).toBe(false);
  });
});
