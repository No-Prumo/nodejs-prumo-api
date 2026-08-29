import { Inject, Injectable } from '@nestjs/common';
import { authErrorReasons } from '@auth/application/errors/auth-error-reasons';
import {
  invalidMagicLinkToken,
  magicLinkAlreadyUsed,
  magicLinkExpired,
  magicLinkSuperseded,
} from '@auth/application/errors/auth-errors';
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from '../../ports/accounts.repository';
import {
  MAGIC_LINK_CHALLENGES_REPOSITORY,
  type MagicLinkChallengesRepository,
} from '../../ports/magic-link-challenges.repository';
import { MagicLinkTokenService } from '../../services/tokens/magic-link-token.service';
import { BetaAccessPolicy } from '../../services/beta-access/beta-access-policy';
import { CreateAuthSessionUseCase } from '../create-auth-session/create-auth-session.use-case';
import type {
  ConsumeMagicLinkUseCaseRequest,
  ConsumeMagicLinkUseCaseResponse,
} from './consume-magic-link.use-case.types';

@Injectable()
class ConsumeMagicLinkUseCase {
  constructor(
    @Inject(MAGIC_LINK_CHALLENGES_REPOSITORY)
    private readonly magicLinkChallengesRepository: MagicLinkChallengesRepository,
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository,
    private readonly magicLinkTokenService: MagicLinkTokenService,
    private readonly betaAccessPolicy: BetaAccessPolicy,
    private readonly createAuthSession: CreateAuthSessionUseCase,
  ) {}

  async execute(
    request: ConsumeMagicLinkUseCaseRequest,
  ): Promise<ConsumeMagicLinkUseCaseResponse> {
    const consumeResult =
      await this.magicLinkChallengesRepository.consumeByTokenHash(
        this.magicLinkTokenService.hash(request.token),
        new Date(),
      );

    if (consumeResult.status === 'invalid') {
      throw invalidMagicLinkToken({
        action: 'consume_magic_link',
        reason: authErrorReasons.challengeNotFoundExpiredOrConsumed,
      });
    }

    if (consumeResult.status === 'expired') {
      throw magicLinkExpired({
        action: 'consume_magic_link',
        reason: authErrorReasons.challengeExpired,
      });
    }

    if (consumeResult.status === 'already_used') {
      throw magicLinkAlreadyUsed({
        action: 'consume_magic_link',
        reason: authErrorReasons.challengeAlreadyUsed,
      });
    }

    if (consumeResult.status === 'revoked') {
      throw magicLinkSuperseded({
        action: 'consume_magic_link',
        reason: authErrorReasons.challengeRevoked,
      });
    }

    const { challenge } = consumeResult;

    if (!(await this.betaAccessPolicy.isEligible(challenge.email))) {
      throw invalidMagicLinkToken({
        action: 'consume_magic_link',
        reason: authErrorReasons.betaInvitationRequired,
      });
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
