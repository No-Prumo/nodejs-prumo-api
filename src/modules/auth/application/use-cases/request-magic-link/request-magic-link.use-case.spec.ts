import { buildTestAuthConfig } from '@test-support/auth/build-test-auth-config';
import { buildTestEmailConfig } from '@test-support/email/build-test-email-config';
import { InMemoryMagicLinkChallengesRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-magic-link-challenges.repository';
import { InMemoryBetaInvitationsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-beta-invitations.repository';
import { secondsToMilliseconds } from '@shared/time/time.helpers';
import type { EmailGateway } from '../../ports/email-gateway';
import type { SendMagicLinkEmailRequest } from '../../ports/email-gateway.types';
import { MagicLinkUrlBuilder } from '../../services/email/magic-link-url.builder';
import { MagicLinkTokenService } from '../../services/tokens/magic-link-token.service';
import { BetaAccessPolicy } from '../../services/beta-access/beta-access-policy';
import {
  magicLinkRequestStatus,
  RequestMagicLinkUseCase,
} from './request-magic-link.use-case';

const magicLinkTtlSeconds = 600;
const magicLinkTtlMilliseconds = secondsToMilliseconds(magicLinkTtlSeconds);
const authSettings = buildTestAuthConfig({
  AUTH_MAGIC_LINK_TTL_SECONDS: `${magicLinkTtlSeconds}`,
});
const emailSettings = buildTestEmailConfig();

class FakeEmailGateway implements EmailGateway {
  readonly sentMagicLinks: SendMagicLinkEmailRequest[] = [];

  sendMagicLink(request: SendMagicLinkEmailRequest): Promise<void> {
    this.sentMagicLinks.push(request);

    return Promise.resolve();
  }
}

describe('RequestMagicLinkUseCase', () => {
  function makeSut() {
    const challengesRepository = new InMemoryMagicLinkChallengesRepository();
    const emailGateway = new FakeEmailGateway();
    const betaInvitationsRepository = new InMemoryBetaInvitationsRepository();
    betaInvitationsRepository.invite('user@example.com');
    const tokenService = new MagicLinkTokenService();
    const useCase = new RequestMagicLinkUseCase(
      challengesRepository,
      emailGateway,
      new MagicLinkUrlBuilder(emailSettings),
      tokenService,
      new BetaAccessPolicy(betaInvitationsRepository),
      authSettings,
    );

    return {
      challengesRepository,
      emailGateway,
      betaInvitationsRepository,
      tokenService,
      useCase,
    };
  }

  it('returns a generic success response and sends the normalized email', async () => {
    const { emailGateway, useCase } = makeSut();

    const result = await useCase.execute({
      email: ' User@Example.com ',
    });

    expect(result).toEqual({
      status: magicLinkRequestStatus,
    });
    expect(emailGateway.sentMagicLinks).toHaveLength(1);
    expect(emailGateway.sentMagicLinks[0]?.email).toBe('user@example.com');
  });

  it('stores only a hashed short-lived token', async () => {
    const { challengesRepository, emailGateway, tokenService, useCase } =
      makeSut();
    const beforeRequest = Date.now();

    await useCase.execute({
      email: 'user@example.com',
    });

    const [challenge] = challengesRepository.magicLinkChallenges;
    const [sentEmail] = emailGateway.sentMagicLinks;

    expect(challenge).toBeDefined();
    expect(sentEmail).toBeDefined();
    const sentToken = new URL(sentEmail?.magicLinkUrl ?? '').searchParams.get(
      'token',
    );

    expect(sentToken).not.toBeNull();
    expect(challenge?.tokenHash).toBe(tokenService.hash(sentToken ?? ''));
    expect(challenge?.tokenHash).not.toBe(sentToken);
    expect(challenge?.expiresAt.getTime()).toBeGreaterThanOrEqual(
      beforeRequest + magicLinkTtlMilliseconds,
    );
    expect(challenge?.expiresAt.getTime()).toBeLessThanOrEqual(
      Date.now() + magicLinkTtlMilliseconds,
    );
  });

  it('returns the same response without creating a challenge for a non-invited email', async () => {
    const { challengesRepository, emailGateway, useCase } = makeSut();

    const result = await useCase.execute({
      email: 'not-invited@example.com',
    });

    expect(result).toEqual({ status: magicLinkRequestStatus });
    expect(challengesRepository.magicLinkChallenges).toHaveLength(0);
    expect(emailGateway.sentMagicLinks).toHaveLength(0);
  });

  it('supersedes an active challenge when the email requests another link', async () => {
    const { challengesRepository, useCase } = makeSut();

    await useCase.execute({ email: 'user@example.com' });
    await useCase.execute({ email: 'user@example.com' });

    expect(challengesRepository.magicLinkChallenges).toHaveLength(2);
    expect(
      challengesRepository.magicLinkChallenges[0]?.revokedAt,
    ).not.toBeNull();
    expect(challengesRepository.magicLinkChallenges[1]?.revokedAt).toBeNull();
  });
});
