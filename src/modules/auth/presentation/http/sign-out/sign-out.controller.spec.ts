import { buildAuthConfig, validateEnv } from '../../../../../config';
import { SignOutController } from './sign-out.controller';

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

describe('SignOutController', () => {
  it('revokes the current session and clears the refresh token cookie', async () => {
    const signOut = {
      execute: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    const response = {
      cookie: vi.fn(),
    };
    const controller = new SignOutController(signOut as never, authSettings);

    await controller.signOutCurrentSession(
      'Bearer access.token.signature',
      response as never,
    );

    expect(signOut.execute).toHaveBeenCalledWith({
      accessToken: 'access.token.signature',
    });
    expect(response.cookie).toHaveBeenCalledWith(
      authSettings.refreshTokenCookie.name,
      '',
      expect.objectContaining({
        maxAge: 0,
        path: authSettings.refreshTokenCookie.path,
      }),
    );
  });
});
