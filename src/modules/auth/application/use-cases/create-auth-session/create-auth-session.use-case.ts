import { Inject, Injectable } from '@nestjs/common';
import { authErrorReasons } from '@auth/application/errors/auth-error-reasons';
import {
  accountAuthForbidden,
  accountNotFound,
} from '@auth/application/errors/auth-errors';
import { authConfig, type AuthConfig } from '@config';
import { addSeconds } from '@shared/time/time.helpers';
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from '../../ports/accounts.repository';
import {
  AUTH_SESSIONS_REPOSITORY,
  type AuthSessionsRepository,
} from '../../ports/auth-sessions.repository';
import { RefreshTokenHasher } from '../../services/tokens/refresh-token-hasher';
import { TokenService } from '../../services/tokens/token.service';
import type {
  CreateAuthSessionUseCaseRequest,
  CreateAuthSessionUseCaseResponse,
} from './create-auth-session.use-case.types';

@Injectable()
class CreateAuthSessionUseCase {
  constructor(
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository,
    @Inject(AUTH_SESSIONS_REPOSITORY)
    private readonly authSessionsRepository: AuthSessionsRepository,
    private readonly refreshTokenHasher: RefreshTokenHasher,
    private readonly tokenService: TokenService,
    @Inject(authConfig.KEY)
    private readonly authSettings: AuthConfig,
  ) {}

  async execute(
    request: CreateAuthSessionUseCaseRequest,
  ): Promise<CreateAuthSessionUseCaseResponse> {
    const account = await this.accountsRepository.findById(request.accountId);

    if (!account) {
      throw accountNotFound({
        accountId: request.accountId,
        action: 'create_auth_session',
        reason: authErrorReasons.accountNotFound,
      });
    }

    if (account.status !== 'active') {
      throw accountAuthForbidden({
        accountId: account.id,
        action: 'create_auth_session',
        reason: authErrorReasons.accountStatusNotActive,
        status: account.status,
      });
    }

    const now = new Date();
    const refreshToken = this.tokenService.generateOpaqueRefreshToken();
    const refreshTokenHash = this.refreshTokenHasher.hash(refreshToken);
    const refreshTokenIdleExpiresAt = addSeconds(
      now,
      this.authSettings.refreshTokenIdleTtlSeconds,
    );
    const refreshTokenAbsoluteExpiresAt = addSeconds(
      now,
      this.authSettings.refreshTokenAbsoluteTtlSeconds,
    );

    const session = await this.authSessionsRepository.create({
      accountId: account.id,
      refreshTokenHash,
      refreshTokenFamilyId: this.tokenService.generateRefreshTokenFamilyId(),
      creationSource: request.creationSource,
      userAgent: request.userAgent,
      ipAddress: request.ipAddress,
      idleExpiresAt: refreshTokenIdleExpiresAt,
      absoluteExpiresAt: refreshTokenAbsoluteExpiresAt,
    });

    const accessToken = this.tokenService.issueAccessToken({
      sub: account.id,
      sessionId: session.id,
    });

    return {
      account: {
        id: account.id,
        email: account.email,
        displayName: account.displayName,
      },
      session: {
        id: session.id,
      },
      accessToken: accessToken.token,
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshToken,
      refreshTokenIdleExpiresAt,
      refreshTokenAbsoluteExpiresAt,
    };
  }
}

export { CreateAuthSessionUseCase };
