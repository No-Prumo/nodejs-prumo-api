import { buildAuthConfig, validateEnv } from '../../../../../config';
import { InMemoryMagicLinkChallengesRepository } from '../../../infrastructure/persistence/in-memory/in-memory-magic-link-challenges.repository';
import type {
  EmailGateway,
  SendMagicLinkEmailRequest,
} from '../../ports/email-gateway';
import { MagicLinkTokenService } from '../../services/tokens/magic-link-token.service';
import {
  magicLinkRequestMessage,
  RequestMagicLinkUseCase,
} from './request-magic-link.use-case';

const authSettings = buildAuthConfig(
  validateEnv({
    AUTH_MAGIC_LINK_TTL_SECONDS: '600',
    DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
    POSTGRES_DB: 'sandicts',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PASSWORD: 'sandicts',
    POSTGRES_PORT: '5432',
    POSTGRES_USER: 'postgres',
  }),
);

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
    const tokenService = new MagicLinkTokenService();
    const useCase = new RequestMagicLinkUseCase(
      challengesRepository,
      emailGateway,
      tokenService,
      authSettings,
    );

    return {
      challengesRepository,
      emailGateway,
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
      message: magicLinkRequestMessage,
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
    expect(challenge?.tokenHash).toBe(
      tokenService.hash(sentEmail?.token ?? ''),
    );
    expect(challenge?.tokenHash).not.toBe(sentEmail?.token);
    expect(challenge?.expiresAt.getTime()).toBeGreaterThanOrEqual(
      beforeRequest + 600 * 1000,
    );
    expect(challenge?.expiresAt.getTime()).toBeLessThanOrEqual(
      Date.now() + 600 * 1000,
    );
  });
});
