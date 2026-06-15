import {
  Controller,
  Headers,
  HttpCode,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { authConfig, type AuthConfig } from '../../../../../config';
import { SignOutUseCase } from '../../../application/use-cases/sign-out/sign-out.use-case';
import { buildClearRefreshTokenCookieOptions } from '../shared/auth-cookie.helper';
import { readBearerToken } from '../shared/bearer-token.helper';

@ApiTags('Auth')
@Controller('auth')
class SignOutController {
  constructor(
    private readonly signOut: SignOutUseCase,
    @Inject(authConfig.KEY)
    private readonly authSettings: AuthConfig,
  ) {}

  @Post('sign-out')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Sign out',
    description:
      'Revokes the current auth session and clears the refresh cookie.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer access token for the current session.',
    required: true,
  })
  @ApiNoContentResponse({ description: 'Current auth session signed out' })
  async signOutCurrentSession(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.signOut.execute({
      accessToken: readBearerToken(authorizationHeader) ?? '',
    });

    response.cookie(
      this.authSettings.refreshTokenCookie.name,
      '',
      buildClearRefreshTokenCookieOptions(this.authSettings),
    );
  }
}

export { SignOutController };
