import { Inject, Injectable } from '@nestjs/common';
import { authConfig, type AuthConfig } from '@config';
import { addSeconds } from '@shared/time/time.helpers';
import { EMAIL_GATEWAY, type EmailGateway } from '../../ports/email-gateway';
import {
  MAGIC_LINK_CHALLENGES_REPOSITORY,
  type MagicLinkChallengesRepository,
} from '../../ports/magic-link-challenges.repository';
import { normalizeEmail } from '../../services/email/normalize-email';
import { MagicLinkTokenService } from '../../services/tokens/magic-link-token.service';
import type {
  RequestMagicLinkUseCaseRequest,
  RequestMagicLinkUseCaseResponse,
} from './request-magic-link.use-case.types';

const magicLinkRequestMessage =
  'If the email can sign in, a magic link will be sent.';

@Injectable()
class RequestMagicLinkUseCase {
  constructor(
    @Inject(MAGIC_LINK_CHALLENGES_REPOSITORY)
    private readonly magicLinkChallengesRepository: MagicLinkChallengesRepository,
    @Inject(EMAIL_GATEWAY)
    private readonly emailGateway: EmailGateway,
    private readonly magicLinkTokenService: MagicLinkTokenService,
    @Inject(authConfig.KEY)
    private readonly authSettings: AuthConfig,
  ) {}

  async execute(
    request: RequestMagicLinkUseCaseRequest,
  ): Promise<RequestMagicLinkUseCaseResponse> {
    const normalizedEmail = normalizeEmail(request.email);
    const token = this.magicLinkTokenService.generateToken();
    const expiresAt = addSeconds(
      new Date(),
      this.authSettings.magicLinkTtlSeconds,
    );

    await this.magicLinkChallengesRepository.create({
      email: normalizedEmail,
      tokenHash: this.magicLinkTokenService.hash(token),
      expiresAt,
    });

    await this.emailGateway.sendMagicLink({
      email: normalizedEmail,
      token,
      expiresAt,
    });

    return {
      message: magicLinkRequestMessage,
    };
  }
}

export { RequestMagicLinkUseCase, magicLinkRequestMessage, normalizeEmail };
