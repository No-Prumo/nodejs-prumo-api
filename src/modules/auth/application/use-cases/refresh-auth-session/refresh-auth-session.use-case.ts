import { Inject, Injectable } from '@nestjs/common';
import { authErrorReasons } from '@auth/application/errors/auth-error-reasons';
import {
  accountAuthForbidden,
  authSessionInactive,
  invalidRefreshToken,
  refreshTokenExpired,
  refreshTokenReused,
  refreshTokenRevoked,
} from '@auth/application/errors/auth-errors';
import { authConfig, type AuthConfig } from '@config';
import { addSeconds } from '@shared/time/time.helpers';
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from '../../ports/accounts.repository';
import {
  AUTH_SESSIONS_REPOSITORY,
  type AuthRefreshTokenRecord,
  type AuthSessionsRepository,
} from '../../ports/auth-sessions.repository';
import { RefreshTokenHasher } from '../../services/tokens/refresh-token-hasher';
import { TokenService } from '../../services/tokens/token.service';
import type {
  RefreshAuthSessionUseCaseRequest,
  RefreshAuthSessionUseCaseResponse,
} from './refresh-auth-session.use-case.types';

@Injectable()
class RefreshAuthSessionUseCase {
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
    request: RefreshAuthSessionUseCaseRequest,
  ): Promise<RefreshAuthSessionUseCaseResponse> {
    const now = new Date();
    const previousRefreshTokenHash = this.refreshTokenHasher.hash(
      request.refreshToken,
    );
    const refreshTokenRecord =
      await this.authSessionsRepository.findRefreshTokenByHash(
        previousRefreshTokenHash,
      );

    if (!refreshTokenRecord) {
      throw invalidRefreshToken({
        action: 'refresh_auth_session',
        reason: authErrorReasons.tokenHashNotFound,
      });
    }

    if (isRefreshTokenReuse(refreshTokenRecord)) {
      await this.authSessionsRepository.revokeRefreshTokenFamily(
        refreshTokenRecord.refreshTokenFamilyId,
        now,
      );
      throw refreshTokenReused({
        action: 'refresh_auth_session',
        refreshTokenFamilyId: refreshTokenRecord.refreshTokenFamilyId,
        reason: authErrorReasons.rotatedRefreshTokenSubmitted,
        sessionId: refreshTokenRecord.sessionId,
      });
    }

    if (isRefreshTokenRevoked(refreshTokenRecord)) {
      throw refreshTokenRevoked({
        action: 'refresh_auth_session',
        refreshTokenFamilyId: refreshTokenRecord.refreshTokenFamilyId,
        reason: authErrorReasons.revokedRefreshTokenSubmitted,
        sessionId: refreshTokenRecord.sessionId,
      });
    }

    if (!isRefreshable(refreshTokenRecord, now)) {
      await this.authSessionsRepository.revokeSessionById(
        refreshTokenRecord.sessionId,
        now,
      );
      throw getUnrefreshableTokenError(refreshTokenRecord, now);
    }

    const account = await this.accountsRepository.findById(
      refreshTokenRecord.session.accountId,
    );

    if (!account) {
      throw invalidRefreshToken({
        action: 'refresh_auth_session',
        reason: authErrorReasons.accountNotFound,
        sessionId: refreshTokenRecord.sessionId,
      });
    }

    if (account.status !== 'active') {
      throw accountAuthForbidden({
        accountId: account.id,
        action: 'refresh_auth_session',
        reason: authErrorReasons.accountStatusNotActive,
        status: account.status,
      });
    }

    const nextRefreshToken = this.tokenService.generateOpaqueRefreshToken();
    const nextRefreshTokenHash = this.refreshTokenHasher.hash(nextRefreshToken);
    const nextRefreshTokenIdleExpiresAt = minDate(
      addSeconds(now, this.authSettings.refreshTokenIdleTtlSeconds),
      refreshTokenRecord.session.absoluteExpiresAt,
    );

    const rotatedSession = await this.authSessionsRepository.rotateRefreshToken(
      {
        sessionId: refreshTokenRecord.sessionId,
        refreshTokenFamilyId: refreshTokenRecord.refreshTokenFamilyId,
        previousRefreshTokenHash,
        nextRefreshTokenHash,
        nextIdleExpiresAt: nextRefreshTokenIdleExpiresAt,
        absoluteExpiresAt: refreshTokenRecord.session.absoluteExpiresAt,
        usedAt: now,
      },
    );

    if (!rotatedSession) {
      await this.authSessionsRepository.revokeRefreshTokenFamily(
        refreshTokenRecord.refreshTokenFamilyId,
        now,
      );
      throw refreshTokenReused({
        action: 'refresh_auth_session',
        refreshTokenFamilyId: refreshTokenRecord.refreshTokenFamilyId,
        reason: authErrorReasons.refreshRotationConflict,
        sessionId: refreshTokenRecord.sessionId,
      });
    }

    const accessToken = this.tokenService.issueAccessToken({
      sub: account.id,
      sessionId: rotatedSession.id,
    });

    return {
      account: {
        id: account.id,
        email: account.email,
        displayName: account.displayName,
      },
      session: {
        id: rotatedSession.id,
      },
      accessToken: accessToken.token,
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshToken: nextRefreshToken,
      refreshTokenIdleExpiresAt: nextRefreshTokenIdleExpiresAt,
      refreshTokenAbsoluteExpiresAt:
        refreshTokenRecord.session.absoluteExpiresAt,
    };
  }
}

function isRefreshTokenReuse(token: AuthRefreshTokenRecord): boolean {
  return token.status === 'rotated';
}

function isRefreshTokenRevoked(token: AuthRefreshTokenRecord): boolean {
  return token.status === 'revoked' || token.revokedAt !== null;
}

function isRefreshable(token: AuthRefreshTokenRecord, now: Date): boolean {
  const session = token.session;

  return (
    token.status === 'active' &&
    token.revokedAt === null &&
    token.idleExpiresAt > now &&
    token.absoluteExpiresAt > now &&
    session.status === 'active' &&
    session.revokedAt === null &&
    session.idleExpiresAt > now &&
    session.absoluteExpiresAt > now
  );
}

function getUnrefreshableTokenError(
  token: AuthRefreshTokenRecord,
  now: Date,
): Error {
  if (token.idleExpiresAt <= now || token.absoluteExpiresAt <= now) {
    return refreshTokenExpired({
      action: 'refresh_auth_session',
      refreshTokenFamilyId: token.refreshTokenFamilyId,
      reason: authErrorReasons.refreshTokenExpired,
      sessionId: token.sessionId,
    });
  }

  return authSessionInactive({
    action: 'refresh_auth_session',
    refreshTokenFamilyId: token.refreshTokenFamilyId,
    reason: authErrorReasons.sessionInactiveOrExpired,
    sessionId: token.sessionId,
    status: token.session.status,
  });
}

function minDate(first: Date, second: Date): Date {
  return first <= second ? first : second;
}

export { RefreshAuthSessionUseCase };
