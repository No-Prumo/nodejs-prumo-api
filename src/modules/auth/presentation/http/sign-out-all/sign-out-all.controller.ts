import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { authConfig, type AuthConfig } from '@config';
import { SignOutAllUseCase } from '../../../application/use-cases/sign-out-all/sign-out-all.use-case';
import { ApiBearerAccessTokenHeader } from '../shared/api-bearer-access-token-header.decorator';
import { buildClearRefreshTokenCookieOptions } from '../shared/auth-cookie.helper';
import { readBearerToken } from '../shared/bearer-token.helper';

@ApiTags('Auth')
@Controller('auth')
class SignOutAllController {
  constructor(
    private readonly signOutAll: SignOutAllUseCase,
    @Inject(authConfig.KEY)
    private readonly authSettings: AuthConfig,
  ) {}

  @Post('sign-out-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Sign out all sessions',
    description:
      'Revokes all active auth sessions for the authenticated account and clears the refresh cookie for the current browser.',
  })
  @ApiBearerAccessTokenHeader('Bearer access token for the current account.')
  @ApiNoContentResponse({ description: 'All account sessions signed out' })
  async signOutAllSessions(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.signOutAll.execute({
      accessToken: readBearerToken(authorizationHeader) ?? '',
    });

    response.cookie(
      this.authSettings.refreshTokenCookie.name,
      '',
      buildClearRefreshTokenCookieOptions(this.authSettings),
    );
  }
}

export { SignOutAllController };
