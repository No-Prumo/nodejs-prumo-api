import { buildAuthConfig, validateEnv } from '../../../../../config';
import { InMemoryAccountsRepository } from '../../../infrastructure/persistence/in-memory/in-memory-accounts.repository';
import { InMemoryAuthSessionsRepository } from '../../../infrastructure/persistence/in-memory/in-memory-auth-sessions.repository';
import type { AccountRecord } from '../../ports/accounts.repository';
import { RefreshTokenHasher } from '../../services/tokens/refresh-token-hasher';
import { TokenService } from '../../services/tokens/token.service';
import { CreateAuthSessionUseCase } from '../create-auth-session/create-auth-session.use-case';
import { SignOutAllUseCase } from './sign-out-all.use-case';

const account: AccountRecord = {
  id: 'account-id',
  email: 'user@example.com',
  normalizedEmail: 'user@example.com',
  displayName: 'User',
  status: 'active',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const otherAccount: AccountRecord = {
  ...account,
  id: 'other-account-id',
  email: 'other@example.com',
  normalizedEmail: 'other@example.com',
};

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
