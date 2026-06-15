import { buildAuthConfig, validateEnv } from '../../../../../config';
import { InMemoryAccountsRepository } from '../../../infrastructure/persistence/in-memory/in-memory-accounts.repository';
import { InMemoryAuthSessionsRepository } from '../../../infrastructure/persistence/in-memory/in-memory-auth-sessions.repository';
import type { AccountRecord } from '../../ports/accounts.repository';
import { RefreshTokenHasher } from '../../services/tokens/refresh-token-hasher';
import { TokenService } from '../../services/tokens/token.service';
import { CreateAuthSessionUseCase } from '../create-auth-session/create-auth-session.use-case';
import { SignOutUseCase } from './sign-out.use-case';

const account: AccountRecord = {
  id: 'account-id',
  email: 'user@example.com',
  normalizedEmail: 'user@example.com',
  displayName: 'User',
  status: 'active',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
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
