import type { GetCurrentAuthSessionUseCaseResponse } from '../../../application/use-cases/get-current-auth-session/get-current-auth-session.use-case.types';
import { GetCurrentAuthSessionController } from './get-current-auth-session.controller';

describe('GetCurrentAuthSessionController', () => {
  it('returns the current account and session from the bearer access token', async () => {
    const currentSessionResponse: GetCurrentAuthSessionUseCaseResponse = {
      account: {
        id: 'account-id',
        email: 'player@example.com',
        displayName: 'Player Name',
      },
      session: {
        id: 'session-id',
      },
    };
    const getCurrentAuthSession = {
      execute: vi
        .fn<() => Promise<GetCurrentAuthSessionUseCaseResponse>>()
        .mockResolvedValue(currentSessionResponse),
    };
    const controller = new GetCurrentAuthSessionController(
      getCurrentAuthSession as never,
    );

    const result = await controller.getCurrentSession(
      'Bearer access.token.signature',
    );

    expect(getCurrentAuthSession.execute).toHaveBeenCalledWith({
      accessToken: 'access.token.signature',
    });
    expect(result).toEqual(currentSessionResponse);
    expect(result).not.toHaveProperty('accessToken');
  });
});
