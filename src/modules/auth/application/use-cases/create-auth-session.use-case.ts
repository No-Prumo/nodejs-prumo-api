import { Inject, Injectable } from '@nestjs/common';
import {
  authConfig,
  type AuthConfig,
} from '../../../../config/auth/auth.config';
import { AppError } from '../../../../shared/errors/app-error';
import type { AuthSessionCreationSource } from '../../domain/auth-session-creation-source';
import {
  ACCOUNTS_REPOSITORY,
  type AccountRecord,
  type AccountsRepository,
} from '../ports/accounts.repository';
import {
  AUTH_SESSIONS_REPOSITORY,
  type AuthSessionRecord,
  type AuthSessionsRepository,
} from '../ports/auth-sessions.repository';
import { RefreshTokenHasher } from '../services/refresh-token-hasher';
import { TokenService } from '../services/token.service';

type CreateAuthSessionUseCaseRequest = {
  accountId: string;
  creationSource: AuthSessionCreationSource;
  userAgent?: string | null;
  ipAddress?: string | null;
};

type CreateAuthSessionUseCaseResponse = {
  account: AccountRecord;
  session: AuthSessionRecord;
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenIdleExpiresAt: Date;
  refreshTokenAbsoluteExpiresAt: Date;
};

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
      throw new AppError('resource_not_found', 'Account was not found', {
        details: { accountId: request.accountId },
      });
    }

    if (account.status !== 'active') {
      throw new AppError('forbidden', 'Account cannot create auth sessions', {
        details: { accountId: account.id, status: account.status },
      });
    }

    const now = new Date();
    const refreshToken = this.tokenService.generateOpaqueRefreshToken();
    const refreshTokenHash = this.refreshTokenHasher.hash(refreshToken);
    const refreshTokenIdleExpiresAt = this.addSeconds(
      now,
      this.authSettings.refreshTokenIdleTtlSeconds,
    );
    const refreshTokenAbsoluteExpiresAt = this.addSeconds(
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
      account,
      session,
      accessToken: accessToken.token,
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshToken,
      refreshTokenIdleExpiresAt,
      refreshTokenAbsoluteExpiresAt,
    };
  }

  private addSeconds(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds * 1000);
  }
}

export { CreateAuthSessionUseCase };
export type {
  CreateAuthSessionUseCaseRequest,
  CreateAuthSessionUseCaseResponse,
};
