import { Inject, Injectable } from '@nestjs/common';
import { authErrorReasons } from '@auth/application/errors/auth-error-reasons';
import { invalidAccessToken } from '@auth/application/errors/auth-errors';
import {
  AUTH_SESSIONS_REPOSITORY,
  type AuthSessionsRepository,
} from '../../ports/auth-sessions.repository';
import { TokenService } from '../../services/tokens/token.service';
import type { SignOutUseCaseRequest } from './sign-out.use-case.types';

@Injectable()
class SignOutUseCase {
  constructor(
    @Inject(AUTH_SESSIONS_REPOSITORY)
    private readonly authSessionsRepository: AuthSessionsRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(request: SignOutUseCaseRequest): Promise<void> {
    const claims = this.tokenService.verifyAccessToken(request.accessToken);

    if (!claims) {
      throw invalidAccessToken({
        action: 'sign_out',
        reason: authErrorReasons.missingOrInvalidBearerToken,
      });
    }

    await this.authSessionsRepository.revokeSessionById(
      claims.sessionId,
      new Date(),
    );
  }
}

export { SignOutUseCase };
