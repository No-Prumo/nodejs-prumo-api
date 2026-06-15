import { buildAuthConfig, validateEnv } from '../../../../../config';
import type { RefreshAuthSessionUseCaseResponse } from '../../../application/use-cases/refresh-auth-session/refresh-auth-session.use-case.types';
import { RefreshAuthSessionController } from './refresh-auth-session.controller';

const authSettings = buildAuthConfig(
  validateEnv({
    DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
    POSTGRES_DB: 'sandicts',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PASSWORD: 'sandicts',
    POSTGRES_PORT: '5432',
    POSTGRES_USER: 'postgres',
  }),
);

describe('RefreshAuthSessionController', () => {
  it('reads the refresh cookie, rotates it, and omits it from the response body', async () => {
    const refreshResponse: RefreshAuthSessionUseCaseResponse = {
      account: {
        id: 'account-id',
        email: 'player@example.com',
        displayName: 'Player Name',
      },
      session: {
        id: 'session-id',
      },
      accessToken: 'new.access.token',
      accessTokenExpiresAt: new Date('2026-01-01T00:15:00.000Z'),
      refreshToken: 'new-raw-refresh-token',
      refreshTokenIdleExpiresAt: new Date('2026-01-02T00:00:00.000Z'),
      refreshTokenAbsoluteExpiresAt: new Date('2026-01-31T00:00:00.000Z'),
    };
    const refreshAuthSession = {
      execute: vi
        .fn<() => Promise<RefreshAuthSessionUseCaseResponse>>()
        .mockResolvedValue(refreshResponse),
    };
    const response = {
      cookie: vi.fn(),
    };
    const controller = new RefreshAuthSessionController(
      refreshAuthSession as never,
      authSettings,
    );

    const result = await controller.refresh(
      `${authSettings.refreshTokenCookie.name}=raw-refresh-token`,
      'Vitest',
      '127.0.0.1',
      response as never,
    );

    expect(refreshAuthSession.execute).toHaveBeenCalledWith({
      refreshToken: 'raw-refresh-token',
      userAgent: 'Vitest',
      ipAddress: '127.0.0.1',
    });
    expect(response.cookie).toHaveBeenCalledWith(
      authSettings.refreshTokenCookie.name,
      'new-raw-refresh-token',
      expect.objectContaining({
        httpOnly: true,
        path: authSettings.refreshTokenCookie.path,
      }),
    );
    expect(result).toEqual({
      account: {
        id: 'account-id',
        email: 'player@example.com',
        displayName: 'Player Name',
      },
      session: {
        id: 'session-id',
      },
      accessToken: 'new.access.token',
      accessTokenExpiresAt: '2026-01-01T00:15:00.000Z',
    });
    expect(result).not.toHaveProperty('refreshToken');
  });
});
