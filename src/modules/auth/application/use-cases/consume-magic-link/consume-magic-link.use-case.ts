import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '../../../../../shared/errors/app-error';
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from '../../ports/accounts.repository';
import {
  MAGIC_LINK_CHALLENGES_REPOSITORY,
  type MagicLinkChallengesRepository,
} from '../../ports/magic-link-challenges.repository';
import { MagicLinkTokenService } from '../../services/tokens/magic-link-token.service';
import {
  CreateAuthSessionUseCase,
  type CreateAuthSessionUseCaseResponse,
} from '../create-auth-session/create-auth-session.use-case';

type ConsumeMagicLinkUseCaseRequest = {
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
};

type ConsumeMagicLinkUseCaseResponse = {
  account: CreateAuthSessionUseCaseResponse['account'];
  session: CreateAuthSessionUseCaseResponse['session'];
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenIdleExpiresAt: Date;
  refreshTokenAbsoluteExpiresAt: Date;
};

@Injectable()
class ConsumeMagicLinkUseCase {
  constructor(
    @Inject(MAGIC_LINK_CHALLENGES_REPOSITORY)
    private readonly magicLinkChallengesRepository: MagicLinkChallengesRepository,
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository,
    private readonly magicLinkTokenService: MagicLinkTokenService,
    private readonly createAuthSession: CreateAuthSessionUseCase,
  ) {}

  async execute(
    request: ConsumeMagicLinkUseCaseRequest,
  ): Promise<ConsumeMagicLinkUseCaseResponse> {
    const challenge =
      await this.magicLinkChallengesRepository.consumeByTokenHash(
        this.magicLinkTokenService.hash(request.token),
        new Date(),
      );

    if (!challenge) {
      throw new AppError('unauthorized', 'Magic link is invalid or expired');
    }

    const account = await this.accountsRepository.resolveOrCreateByEmail({
      email: challenge.email,
      normalizedEmail: challenge.email,
    });

    const authSession = await this.createAuthSession.execute({
      accountId: account.id,
      creationSource: 'magic_link',
      userAgent: request.userAgent,
      ipAddress: request.ipAddress,
    });

    return {
      account: authSession.account,
      session: authSession.session,
      accessToken: authSession.accessToken,
      accessTokenExpiresAt: authSession.accessTokenExpiresAt,
      refreshToken: authSession.refreshToken,
      refreshTokenIdleExpiresAt: authSession.refreshTokenIdleExpiresAt,
      refreshTokenAbsoluteExpiresAt: authSession.refreshTokenAbsoluteExpiresAt,
    };
  }
}

export { ConsumeMagicLinkUseCase };
export type { ConsumeMagicLinkUseCaseRequest, ConsumeMagicLinkUseCaseResponse };
