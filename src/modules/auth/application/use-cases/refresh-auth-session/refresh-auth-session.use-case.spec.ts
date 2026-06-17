import { buildAccountRecord } from '@test-support/auth/build-account-record';
import { buildTestAuthConfig } from '@test-support/auth/build-test-auth-config';
import { InMemoryAccountsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-accounts.repository';
import { InMemoryAuthSessionsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-auth-sessions.repository';
import { secondsToMilliseconds } from '@shared/time/time.helpers';
import { RefreshTokenHasher } from '../../services/tokens/refresh-token-hasher';
import { TokenService } from '../../services/tokens/token.service';
import { CreateAuthSessionUseCase } from '../create-auth-session/create-auth-session.use-case';
import { RefreshAuthSessionUseCase } from './refresh-auth-session.use-case';

const account = buildAccountRecord();
const authSettings = buildTestAuthConfig();
const expiredRefreshStateOffsetMilliseconds = secondsToMilliseconds(1);

describe('RefreshAuthSessionUseCase', () => {
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
    const useCase = new RefreshAuthSessionUseCase(
      accountsRepository,
      authSessionsRepository,
      refreshTokenHasher,
      tokenService,
      authSettings,
    );

    return {
      accountsRepository,
      authSessionsRepository,
      createAuthSession,
      refreshTokenHasher,
      useCase,
    };
  }

  async function createSession() {
    const sut = makeSut();
    sut.accountsRepository.accounts.push(account);
    const createdSession = await sut.createAuthSession.execute({
      accountId: account.id,
      creationSource: 'magic_link',
      userAgent: 'Vitest',
      ipAddress: '127.0.0.1',
    });

    return {
      ...sut,
      createdSession,
    };
  }

  it('rotates a valid refresh token and returns a new access token', async () => {
    const {
      authSessionsRepository,
      createdSession,
      refreshTokenHasher,
      useCase,
    } = await createSession();

    const result = await useCase.execute({
      refreshToken: createdSession.refreshToken,
    });
    const [session] = authSessionsRepository.authSessions;
    const [previousToken, nextToken] = authSessionsRepository.refreshTokens;

    expect(result.refreshToken).toBeDefined();
    expect(result.refreshToken).not.toBe(createdSession.refreshToken);
    expect(session?.refreshTokenHash).toBe(
      refreshTokenHasher.hash(result.refreshToken),
    );
    expect(previousToken?.status).toBe('rotated');
    expect(nextToken?.status).toBe('active');
    expect(result.accessToken).toContain('.');
    expect(result.account).toEqual({
      id: account.id,
      email: account.email,
      displayName: account.displayName,
    });
  });

  it('rejects invalid refresh tokens without creating new token state', async () => {
    const { authSessionsRepository, useCase } = makeSut();

    await expect(
      useCase.execute({ refreshToken: 'invalid-refresh-token' }),
    ).rejects.toMatchObject({
      code: 'invalid_refresh_token',
    });
    expect(authSessionsRepository.refreshTokens).toHaveLength(0);
  });

  it('revokes the refresh token family when a rotated token is reused', async () => {
    const { authSessionsRepository, createdSession, useCase } =
      await createSession();

    await useCase.execute({
      refreshToken: createdSession.refreshToken,
    });

    await expect(
      useCase.execute({
        refreshToken: createdSession.refreshToken,
      }),
    ).rejects.toMatchObject({
      code: 'refresh_token_reused',
    });

    expect(authSessionsRepository.authSessions[0]?.status).toBe('revoked');
    expect(
      authSessionsRepository.refreshTokens.every(
        (token) => token.status === 'revoked',
      ),
    ).toBe(true);
  });

  it('rejects expired refresh state and revokes the session', async () => {
    const { authSessionsRepository, createdSession, useCase } =
      await createSession();
    const expiredAt = new Date(
      Date.now() - expiredRefreshStateOffsetMilliseconds,
    );

    authSessionsRepository.authSessions[0].idleExpiresAt = expiredAt;
    authSessionsRepository.refreshTokens[0].idleExpiresAt = expiredAt;

    await expect(
      useCase.execute({
        refreshToken: createdSession.refreshToken,
      }),
    ).rejects.toMatchObject({
      code: 'refresh_token_expired',
    });

    expect(authSessionsRepository.authSessions[0]?.status).toBe('revoked');
    expect(authSessionsRepository.refreshTokens[0]?.status).toBe('revoked');
  });
});
