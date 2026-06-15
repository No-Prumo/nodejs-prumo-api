import { Inject, Injectable } from '@nestjs/common';
import { invalidAccessToken } from '../../errors/auth-errors';
import {
  AUTH_SESSIONS_REPOSITORY,
  type AuthSessionsRepository,
} from '../../ports/auth-sessions.repository';
import { TokenService } from '../../services/tokens/token.service';
import type { SignOutAllUseCaseRequest } from './sign-out-all.use-case.types';

@Injectable()
class SignOutAllUseCase {
  constructor(
    @Inject(AUTH_SESSIONS_REPOSITORY)
    private readonly authSessionsRepository: AuthSessionsRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(request: SignOutAllUseCaseRequest): Promise<void> {
    const claims = this.tokenService.verifyAccessToken(request.accessToken);

    if (!claims) {
      throw invalidAccessToken({
        action: 'sign_out_all',
        reason: 'missing_or_invalid_bearer_token',
      });
    }

    await this.authSessionsRepository.revokeActiveSessionsByAccountId(
      claims.sub,
      new Date(),
    );
  }
}

export { SignOutAllUseCase };
