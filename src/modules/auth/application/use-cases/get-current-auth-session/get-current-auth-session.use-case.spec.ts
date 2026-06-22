import { buildAccountRecord } from '@test-support/auth/build-account-record';
import { buildTestAuthConfig } from '@test-support/auth/build-test-auth-config';
import { InMemoryAccountsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-accounts.repository';
import { InMemoryAuthSessionsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-auth-sessions.repository';
import { RefreshTokenHasher } from '../../services/tokens/refresh-token-hasher';
import { TokenService } from '../../services/tokens/token.service';
import { CreateAuthSessionUseCase } from '../create-auth-session/create-auth-session.use-case';
import { GetCurrentAuthSessionUseCase } from './get-current-auth-session.use-case';

const account = buildAccountRecord();
const authSettings = buildTestAuthConfig();

describe('GetCurrentAuthSessionUseCase', () => {
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
    const useCase = new GetCurrentAuthSessionUseCase(
      accountsRepository,
      authSessionsRepository,
      tokenService,
    );

    return {
      accountsRepository,
      authSessionsRepository,
      createAuthSession,
      useCase,
    };
  }

  async function createSession() {
    const sut = makeSut();
    sut.accountsRepository.accounts.push(account);
    const createdSession = await sut.createAuthSession.execute({
      accountId: account.id,
      creationSource: 'google',
    });

    return {
      ...sut,
      createdSession,
    };
  }

  it('returns the current account and session without issuing a new token', async () => {
    const { createdSession, useCase } = await createSession();

    const result = await useCase.execute({
      accessToken: createdSession.accessToken,
    });

    expect(result).toEqual({
      account: {
        id: account.id,
        email: account.email,
        displayName: account.displayName,
      },
      session: {
        id: createdSession.session.id,
      },
    });
    expect(result).not.toHaveProperty('accessToken');
  });

  it('rejects invalid access tokens', async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({ accessToken: 'invalid-access-token' }),
    ).rejects.toMatchObject({
      code: 'invalid_access_token',
    });
  });

  it('rejects inactive sessions', async () => {
    const { authSessionsRepository, createdSession, useCase } =
      await createSession();

    await authSessionsRepository.revokeSessionById(
      createdSession.session.id,
      new Date(),
    );

    await expect(
      useCase.execute({ accessToken: createdSession.accessToken }),
    ).rejects.toMatchObject({
      code: 'auth_session_inactive',
    });
  });

  it('rejects inactive accounts', async () => {
    const { accountsRepository, createdSession, useCase } =
      await createSession();

    accountsRepository.accounts[0].status = 'blocked';

    await expect(
      useCase.execute({ accessToken: createdSession.accessToken }),
    ).rejects.toMatchObject({
      code: 'account_auth_forbidden',
    });
  });
});
