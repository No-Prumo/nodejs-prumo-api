import { buildAccountRecord } from '@test-support/auth/build-account-record';
import { buildTestAuthConfig } from '@test-support/auth/build-test-auth-config';
import { InMemoryAccountsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-accounts.repository';
import { InMemoryAuthSessionsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-auth-sessions.repository';
import { RefreshTokenHasher } from '../../services/tokens/refresh-token-hasher';
import { TokenService } from '../../services/tokens/token.service';
import { CreateAuthSessionUseCase } from './create-auth-session.use-case';

const account = buildAccountRecord({
  email: 'User@Example.com',
  normalizedEmail: 'user@example.com',
});

const authSettings = buildTestAuthConfig();

describe('CreateAuthSessionUseCase', () => {
  function makeSut() {
    const accountsRepository = new InMemoryAccountsRepository();
    const authSessionsRepository = new InMemoryAuthSessionsRepository();
    const hasher = new RefreshTokenHasher();
    const useCase = new CreateAuthSessionUseCase(
      accountsRepository,
      authSessionsRepository,
      hasher,
      new TokenService(authSettings),
      authSettings,
    );

    return {
      accountsRepository,
      authSessionsRepository,
      hasher,
      useCase,
    };
  }

  it('creates a session with a hashed refresh token only', async () => {
    const { accountsRepository, authSessionsRepository, hasher, useCase } =
      makeSut();
    accountsRepository.accounts.push(account);

    const result = await useCase.execute({
      accountId: account.id,
      creationSource: 'magic_link',
      ipAddress: '127.0.0.1',
      userAgent: 'Vitest',
    });

    const [createdSession] = authSessionsRepository.authSessions;

    expect(result.refreshToken).toBeDefined();
    expect(createdSession.refreshTokenHash).toBe(
      hasher.hash(result.refreshToken),
    );
    expect(createdSession.refreshTokenHash).not.toBe(result.refreshToken);
    expect(result.accessToken).toContain('.');
    expect(result.session).toEqual({
      id: createdSession.id,
    });
  });

  it('rejects blocked accounts', async () => {
    const { accountsRepository, authSessionsRepository, useCase } = makeSut();
    accountsRepository.accounts.push(
      buildAccountRecord({
        status: 'blocked',
      }),
    );

    await expect(
      useCase.execute({
        accountId: account.id,
        creationSource: 'google',
      }),
    ).rejects.toMatchObject({
      code: 'account_auth_forbidden',
    });
    expect(authSessionsRepository.authSessions).toHaveLength(0);
  });

  it('rejects missing accounts', async () => {
    const { authSessionsRepository, useCase } = makeSut();

    await expect(
      useCase.execute({
        accountId: account.id,
        creationSource: 'google',
      }),
    ).rejects.toMatchObject({
      code: 'resource_not_found',
    });
    expect(authSessionsRepository.authSessions).toHaveLength(0);
  });
});
