import { buildAccountRecord } from '@test-support/auth/build-account-record';
import { buildTestAuthConfig } from '@test-support/auth/build-test-auth-config';
import { InMemoryAccountsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-accounts.repository';
import { InMemoryAuthSessionsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-auth-sessions.repository';
import { RefreshTokenHasher } from '../../services/tokens/refresh-token-hasher';
import { TokenService } from '../../services/tokens/token.service';
import { CreateAuthSessionUseCase } from '../create-auth-session/create-auth-session.use-case';
import { SignOutUseCase } from './sign-out.use-case';

const account = buildAccountRecord();
const authSettings = buildTestAuthConfig();

describe('SignOutUseCase', () => {
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
    const useCase = new SignOutUseCase(authSessionsRepository, tokenService);

    return {
      accountsRepository,
      authSessionsRepository,
      createAuthSession,
      useCase,
    };
  }

  it('revokes the current session from a valid access token', async () => {
    const {
      accountsRepository,
      authSessionsRepository,
      createAuthSession,
      useCase,
    } = makeSut();
    accountsRepository.accounts.push(account);
    const createdSession = await createAuthSession.execute({
      accountId: account.id,
      creationSource: 'google',
    });

    await useCase.execute({ accessToken: createdSession.accessToken });

    expect(authSessionsRepository.authSessions[0]?.status).toBe('revoked');
    expect(authSessionsRepository.refreshTokens[0]?.status).toBe('revoked');
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
