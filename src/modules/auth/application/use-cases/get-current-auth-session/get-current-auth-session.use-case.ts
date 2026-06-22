import { Inject, Injectable } from '@nestjs/common';
import { authErrorReasons } from '@auth/application/errors/auth-error-reasons';
import {
  accountAuthForbidden,
  authSessionInactive,
  invalidAccessToken,
} from '@auth/application/errors/auth-errors';
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from '../../ports/accounts.repository';
import {
  AUTH_SESSIONS_REPOSITORY,
  type AuthSessionRecord,
  type AuthSessionsRepository,
} from '../../ports/auth-sessions.repository';
import { TokenService } from '../../services/tokens/token.service';
import type {
  GetCurrentAuthSessionUseCaseRequest,
  GetCurrentAuthSessionUseCaseResponse,
} from './get-current-auth-session.use-case.types';

@Injectable()
class GetCurrentAuthSessionUseCase {
  constructor(
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository,
    @Inject(AUTH_SESSIONS_REPOSITORY)
    private readonly authSessionsRepository: AuthSessionsRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    request: GetCurrentAuthSessionUseCaseRequest,
  ): Promise<GetCurrentAuthSessionUseCaseResponse> {
    const claims = this.tokenService.verifyAccessToken(request.accessToken);

    if (!claims) {
      throw invalidAccessToken({
        action: 'get_current_auth_session',
        reason: authErrorReasons.missingOrInvalidBearerToken,
      });
    }

    const session = await this.authSessionsRepository.findById(
      claims.sessionId,
    );

    if (!session || session.accountId !== claims.sub) {
      throw invalidAccessToken({
        action: 'get_current_auth_session',
        reason: authErrorReasons.missingOrInvalidBearerToken,
        sessionId: claims.sessionId,
      });
    }

    if (!isCurrentSessionActive(session, new Date())) {
      throw authSessionInactive({
        action: 'get_current_auth_session',
        reason: authErrorReasons.sessionInactiveOrExpired,
        sessionId: session.id,
        status: session.status,
      });
    }

    const account = await this.accountsRepository.findById(claims.sub);

    if (!account) {
      throw invalidAccessToken({
        action: 'get_current_auth_session',
        reason: authErrorReasons.accountNotFound,
        sessionId: session.id,
      });
    }

    if (account.status !== 'active') {
      throw accountAuthForbidden({
        accountId: account.id,
        action: 'get_current_auth_session',
        reason: authErrorReasons.accountStatusNotActive,
        sessionId: session.id,
        status: account.status,
      });
    }

    return {
      account: {
        id: account.id,
        email: account.email,
        displayName: account.displayName,
      },
      session: {
        id: session.id,
      },
    };
  }
}

function isCurrentSessionActive(
  session: AuthSessionRecord,
  now: Date,
): boolean {
  return (
    session.status === 'active' &&
    session.revokedAt === null &&
    session.idleExpiresAt > now &&
    session.absoluteExpiresAt > now
  );
}

export { GetCurrentAuthSessionUseCase };
