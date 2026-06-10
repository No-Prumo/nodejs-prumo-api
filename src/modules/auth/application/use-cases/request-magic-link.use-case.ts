import { Inject, Injectable } from '@nestjs/common';
import {
  authConfig,
  type AuthConfig,
} from '../../../../config/auth/auth.config';
import { EMAIL_GATEWAY, type EmailGateway } from '../ports/email-gateway';
import {
  MAGIC_LINK_CHALLENGES_REPOSITORY,
  type MagicLinkChallengesRepository,
} from '../ports/magic-link-challenges.repository';
import { MagicLinkTokenService } from '../services/magic-link-token.service';

const magicLinkRequestMessage =
  'If the email can sign in, a magic link will be sent.';

type RequestMagicLinkUseCaseRequest = {
  email: string;
};

type RequestMagicLinkUseCaseResponse = {
  message: string;
};

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
    const expiresAt = this.addSeconds(
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

  private addSeconds(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds * 1000);
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export { RequestMagicLinkUseCase, magicLinkRequestMessage, normalizeEmail };
export type { RequestMagicLinkUseCaseRequest, RequestMagicLinkUseCaseResponse };
