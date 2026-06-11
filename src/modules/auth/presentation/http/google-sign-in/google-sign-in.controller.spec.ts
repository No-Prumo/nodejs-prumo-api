import { buildAuthConfig, validateEnv } from '../../../../../config';
import type { GoogleSignInUseCaseResponse } from '../../../application/use-cases/google-sign-in/google-sign-in.use-case';
import { GoogleSignInController } from './google-sign-in.controller';

const authSettings = buildAuthConfig(
  validateEnv({
    AUTH_GOOGLE_CLIENT_ID: 'google-web-client-id.apps.googleusercontent.com',
    DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
    POSTGRES_DB: 'sandicts',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PASSWORD: 'sandicts',
    POSTGRES_PORT: '5432',
    POSTGRES_USER: 'postgres',
  }),
);

describe('GoogleSignInController', () => {
  it('sets the refresh token cookie and omits it from the sign-in response body', async () => {
    const googleSignInResponse: GoogleSignInUseCaseResponse = {
      account: {
        id: 'account-id',
        email: 'player@example.com',
        displayName: 'Player Name',
      },
      session: {
        id: 'session-id',
      },
      accessToken: 'access.token.signature',
      accessTokenExpiresAt: new Date('2026-01-01T00:15:00.000Z'),
      refreshToken: 'raw-refresh-token',
      refreshTokenIdleExpiresAt: new Date('2026-01-02T00:00:00.000Z'),
      refreshTokenAbsoluteExpiresAt: new Date('2026-01-31T00:00:00.000Z'),
    };
    const googleSignIn = {
      execute: vi
        .fn<() => Promise<GoogleSignInUseCaseResponse>>()
        .mockResolvedValue(googleSignInResponse),
    };
    const response = {
      cookie: vi.fn(),
    };
    const controller = new GoogleSignInController(
      googleSignIn as never,
      authSettings,
    );

    const result = await controller.signIn(
      { credential: 'google-id-token' },
      'Vitest',
      '127.0.0.1',
      response as never,
    );

    expect(googleSignIn.execute).toHaveBeenCalledWith({
      credential: 'google-id-token',
      userAgent: 'Vitest',
      ipAddress: '127.0.0.1',
    });
    expect(response.cookie).toHaveBeenCalledWith(
      authSettings.refreshTokenCookie.name,
      'raw-refresh-token',
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
      accessToken: 'access.token.signature',
      accessTokenExpiresAt: '2026-01-01T00:15:00.000Z',
    });
    expect(result).not.toHaveProperty('refreshToken');
  });

  it('accepts idToken as a backwards-compatible request alias', async () => {
    const googleSignIn = {
      execute: vi
        .fn<() => Promise<GoogleSignInUseCaseResponse>>()
        .mockResolvedValue({
          account: {
            id: 'account-id',
            email: 'player@example.com',
            displayName: null,
          },
          session: {
            id: 'session-id',
          },
          accessToken: 'access.token.signature',
          accessTokenExpiresAt: new Date('2026-01-01T00:15:00.000Z'),
          refreshToken: 'raw-refresh-token',
          refreshTokenIdleExpiresAt: new Date('2026-01-02T00:00:00.000Z'),
          refreshTokenAbsoluteExpiresAt: new Date('2026-01-31T00:00:00.000Z'),
        }),
    };
    const controller = new GoogleSignInController(
      googleSignIn as never,
      authSettings,
    );

    await controller.signIn(
      { idToken: 'google-id-token' },
      undefined,
      undefined,
      { cookie: vi.fn() } as never,
    );

    expect(googleSignIn.execute).toHaveBeenCalledWith({
      credential: 'google-id-token',
      userAgent: undefined,
      ipAddress: undefined,
    });
  });
});
