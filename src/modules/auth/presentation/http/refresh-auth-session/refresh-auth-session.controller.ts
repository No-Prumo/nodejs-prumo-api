import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Ip,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { ZodResponse } from 'nestjs-zod';
import { authConfig, type AuthConfig } from '@config';
import { RefreshAuthSessionUseCase } from '../../../application/use-cases/refresh-auth-session/refresh-auth-session.use-case';
import {
  authRateLimitWindowMilliseconds,
  refreshAuthSessionRateLimit,
} from '../shared/auth-http-rate-limit.constants';
import { ApiAuthErrorResponses } from '../shared/api-auth-error-responses.decorator';
import {
  buildRefreshTokenCookieOptions,
  readCookieValue,
} from '../shared/auth-cookie.helper';
import { RefreshAuthSessionResponseDto } from './refresh-auth-session.schemas';

@ApiTags('Auth')
@Controller('auth')
class RefreshAuthSessionController {
  constructor(
    private readonly refreshAuthSession: RefreshAuthSessionUseCase,
    @Inject(authConfig.KEY)
    private readonly authSettings: AuthConfig,
  ) {}

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: refreshAuthSessionRateLimit,
      ttl: authRateLimitWindowMilliseconds,
    },
  })
  @ApiOperation({
    summary: 'Refresh auth session',
    description:
      'Rotates the refresh token cookie and returns a new access token.',
  })
  @ApiAuthErrorResponses({
    unauthorized: [
      'invalid_refresh_token',
      'refresh_token_expired',
      'refresh_token_reused',
      'refresh_token_revoked',
      'auth_session_inactive',
    ],
    forbidden: ['account_auth_forbidden'],
    includeRateLimit: true,
  })
  @ZodResponse({
    status: HttpStatus.OK,
    description: 'Refreshed authenticated session response',
    type: RefreshAuthSessionResponseDto,
  })
  async refresh(
    @Headers('cookie') cookieHeader: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ipAddress: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RefreshAuthSessionResponseDto> {
    const refreshToken = readCookieValue(
      cookieHeader,
      this.authSettings.refreshTokenCookie.name,
    );

    const result = await this.refreshAuthSession.execute({
      refreshToken: refreshToken ?? '',
      userAgent,
      ipAddress,
    });

    response.cookie(
      this.authSettings.refreshTokenCookie.name,
      result.refreshToken,
      buildRefreshTokenCookieOptions(
        this.authSettings,
        result.refreshTokenIdleExpiresAt,
      ),
    );

    return {
      account: {
        id: result.account.id,
        email: result.account.email,
        displayName: result.account.displayName,
      },
      session: {
        id: result.session.id,
      },
      accessToken: result.accessToken,
      accessTokenExpiresAt: result.accessTokenExpiresAt.toISOString(),
    };
  }
}

export { RefreshAuthSessionController };
