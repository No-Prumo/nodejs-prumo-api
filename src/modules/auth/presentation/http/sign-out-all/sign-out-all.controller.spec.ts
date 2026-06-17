import { buildTestAuthConfig } from '@test-support/auth/build-test-auth-config';
import { SignOutAllController } from './sign-out-all.controller';

const authSettings = buildTestAuthConfig();

describe('SignOutAllController', () => {
  it('revokes all account sessions and clears the refresh token cookie', async () => {
    const signOutAll = {
      execute: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    const response = {
      cookie: vi.fn(),
    };
    const controller = new SignOutAllController(
      signOutAll as never,
      authSettings,
    );

    await controller.signOutAllSessions(
      'Bearer access.token.signature',
      response as never,
    );

    expect(signOutAll.execute).toHaveBeenCalledWith({
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
