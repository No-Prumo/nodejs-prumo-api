import { buildAccountRecord } from '@test-support/auth/build-account-record';
import { buildTestAuthConfig } from '@test-support/auth/build-test-auth-config';
import { InMemoryAccountsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-accounts.repository';
import { InMemoryAuthSessionsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-auth-sessions.repository';
import { RefreshTokenHasher } from '../../services/tokens/refresh-token-hasher';
import { TokenService } from '../../services/tokens/token.service';
import { CreateAuthSessionUseCase } from '../create-auth-session/create-auth-session.use-case';
import { SignOutAllUseCase } from './sign-out-all.use-case';

const account = buildAccountRecord();
const otherAccount = buildAccountRecord({
  id: 'other-account-id',
  email: 'other@example.com',
  normalizedEmail: 'other@example.com',
});

const authSettings = buildTestAuthConfig();

describe('SignOutAllUseCase', () => {
  function makeSut() {
    const accountsRepository = new InMemoryAccountsRepository();
    const authSessionsRepository = new InMemoryAuthSessionsRepository();
    const refreshTokenHasher = new RefreshTokenHasher();
    const tokenService = new TokenService(authSettings);
    const createAuthSession = new CreateAuthSessionUseCase(
      accountsRepository,
      authSessionsRepository,
      refreshTokenHasher,
      tokenService,
      authSettings,
    );
    const useCase = new SignOutAllUseCase(authSessionsRepository, tokenService);

    return {
      accountsRepository,
      authSessionsRepository,
      createAuthSession,
      useCase,
    };
  }

  it('revokes all active sessions for the authenticated account only', async () => {
    const {
      accountsRepository,
      authSessionsRepository,
      createAuthSession,
      useCase,
    } = makeSut();
    accountsRepository.accounts.push(account, otherAccount);
    const firstSession = await createAuthSession.execute({
      accountId: account.id,
      creationSource: 'google',
    });
    await createAuthSession.execute({
      accountId: account.id,
      creationSource: 'magic_link',
    });
    await createAuthSession.execute({
      accountId: otherAccount.id,
      creationSource: 'google',
    });

    await useCase.execute({ accessToken: firstSession.accessToken });

    const accountSessions = authSessionsRepository.authSessions.filter(
      (session) => session.accountId === account.id,
    );
    const otherAccountSessions = authSessionsRepository.authSessions.filter(
      (session) => session.accountId === otherAccount.id,
    );

    expect(
      accountSessions.every((session) => session.status === 'revoked'),
    ).toBe(true);
    expect(
      authSessionsRepository.refreshTokens
        .filter((token) =>
          accountSessions.some((session) => session.id === token.sessionId),
        )
        .every((token) => token.status === 'revoked'),
    ).toBe(true);
    expect(otherAccountSessions[0]?.status).toBe('active');
  });

  it('rejects invalid access tokens', async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({ accessToken: 'invalid-access-token' }),
    ).rejects.toMatchObject({
      code: 'invalid_access_token',
    });
  });
});
