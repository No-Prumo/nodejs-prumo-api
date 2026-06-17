import { buildTestAuthConfig } from '@test-support/auth/build-test-auth-config';
import { InMemoryAccountsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-accounts.repository';
import { InMemoryAuthSessionsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-auth-sessions.repository';
import { InMemoryMagicLinkChallengesRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-magic-link-challenges.repository';
import {
  minutesToMilliseconds,
  secondsToMilliseconds,
} from '@shared/time/time.helpers';
import { MagicLinkTokenService } from '../../services/tokens/magic-link-token.service';
import { RefreshTokenHasher } from '../../services/tokens/refresh-token-hasher';
import { TokenService } from '../../services/tokens/token.service';
import { ConsumeMagicLinkUseCase } from './consume-magic-link.use-case';
import { CreateAuthSessionUseCase } from '../create-auth-session/create-auth-session.use-case';

const authSettings = buildTestAuthConfig();
const validMagicLinkWindowMinutes = 15;
const validMagicLinkWindowMilliseconds = minutesToMilliseconds(
  validMagicLinkWindowMinutes,
);
const expiredMagicLinkOffsetMilliseconds = secondsToMilliseconds(1);

describe('ConsumeMagicLinkUseCase', () => {
  function makeSut() {
    const accountsRepository = new InMemoryAccountsRepository();
    const authSessionsRepository = new InMemoryAuthSessionsRepository();
    const challengesRepository = new InMemoryMagicLinkChallengesRepository();
    const magicLinkTokenService = new MagicLinkTokenService();
    const createAuthSession = new CreateAuthSessionUseCase(
      accountsRepository,
      authSessionsRepository,
      new RefreshTokenHasher(),
      new TokenService(authSettings),
      authSettings,
    );
    const useCase = new ConsumeMagicLinkUseCase(
      challengesRepository,
      accountsRepository,
      magicLinkTokenService,
      createAuthSession,
    );

    return {
      accountsRepository,
      authSessionsRepository,
      challengesRepository,
      magicLinkTokenService,
      useCase,
    };
  }

  async function createChallenge(
    challengesRepository: InMemoryMagicLinkChallengesRepository,
    magicLinkTokenService: MagicLinkTokenService,
    token: string,
    email = 'user@example.com',
    expiresAt = new Date(Date.now() + validMagicLinkWindowMilliseconds),
  ) {
    return challengesRepository.create({
      email,
      tokenHash: magicLinkTokenService.hash(token),
      expiresAt,
    });
  }

  it('creates an account and internal auth session for a valid token', async () => {
    const {
      accountsRepository,
      authSessionsRepository,
      challengesRepository,
      magicLinkTokenService,
      useCase,
    } = makeSut();
    const token = magicLinkTokenService.generateToken();
    await createChallenge(challengesRepository, magicLinkTokenService, token);

    const result = await useCase.execute({
      token,
      ipAddress: '127.0.0.1',
      userAgent: 'Vitest',
    });

    expect(accountsRepository.accounts).toHaveLength(1);
    expect(result.account.email).toBe('user@example.com');
    expect(authSessionsRepository.authSessions).toHaveLength(1);
    expect(result.session.id).toBe(authSessionsRepository.authSessions[0]?.id);
    expect(result.accessToken).toContain('.');
    expect(result.refreshToken).toBeDefined();
  });

  it('resolves an existing account instead of creating a duplicate', async () => {
    const {
      accountsRepository,
      challengesRepository,
      magicLinkTokenService,
      useCase,
    } = makeSut();
    const token = magicLinkTokenService.generateToken();
    const existingAccount = await accountsRepository.create({
      email: 'user@example.com',
      normalizedEmail: 'user@example.com',
    });
    await createChallenge(challengesRepository, magicLinkTokenService, token);

    const result = await useCase.execute({ token });

    expect(accountsRepository.accounts).toHaveLength(1);
    expect(result.account.id).toBe(existingAccount.id);
  });

  it('rejects invalid, expired, and already used tokens', async () => {
    const { challengesRepository, magicLinkTokenService, useCase } = makeSut();
    const expiredToken = magicLinkTokenService.generateToken();
    const usedToken = magicLinkTokenService.generateToken();
    await createChallenge(
      challengesRepository,
      magicLinkTokenService,
      expiredToken,
      'expired@example.com',
      new Date(Date.now() - expiredMagicLinkOffsetMilliseconds),
    );
    await createChallenge(
      challengesRepository,
      magicLinkTokenService,
      usedToken,
    );

    await expect(
      useCase.execute({ token: 'invalid-token' }),
    ).rejects.toMatchObject({
      code: 'invalid_magic_link_token',
    });
    await expect(
      useCase.execute({ token: expiredToken }),
    ).rejects.toMatchObject({
      code: 'invalid_magic_link_token',
    });

    await useCase.execute({ token: usedToken });

    await expect(useCase.execute({ token: usedToken })).rejects.toMatchObject({
      code: 'invalid_magic_link_token',
    });
  });
});
