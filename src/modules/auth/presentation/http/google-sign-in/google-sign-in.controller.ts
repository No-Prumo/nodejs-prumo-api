import {
  Body,
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
import { ApiErrorResponses } from '@infra/http/openapi/api-error-responses.decorator';
import { GoogleSignInUseCase } from '../../../application/use-cases/google-sign-in/google-sign-in.use-case';
import {
  authRateLimitWindowMilliseconds,
  googleSignInRateLimit,
} from '../shared/auth-http-rate-limit.constants';
import { buildRefreshTokenCookieOptions } from '../shared/auth-cookie.helper';
import {
  GoogleSignInBodyDto,
  GoogleSignInResponseDto,
} from './google-sign-in.schemas';

@ApiTags('Auth')
@Controller('auth/google')
class GoogleSignInController {
  constructor(
    private readonly googleSignIn: GoogleSignInUseCase,
    @Inject(authConfig.KEY)
    private readonly authSettings: AuthConfig,
  ) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: googleSignInRateLimit,
      ttl: authRateLimitWindowMilliseconds,
    },
  })
  @ApiOperation({
    summary: 'Sign in with Google',
    description:
      'Validates a Google Sign-In or One Tap ID token and creates an auth session.',
  })
  @ApiErrorResponses({
    badRequest: ['validation_error'],
    unauthorized: ['invalid_google_credential'],
    forbidden: ['account_auth_forbidden'],
    conflict: ['external_identity_conflict'],
    tooManyRequests: ['rate_limited'],
    internalServerError: ['internal_error'],
  })
  @ZodResponse({
    status: HttpStatus.OK,
    description: 'Authenticated session response',
    type: GoogleSignInResponseDto,
  })
  async signIn(
    @Body() body: GoogleSignInBodyDto,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ipAddress: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<GoogleSignInResponseDto> {
    const result = await this.googleSignIn.execute({
      credential: (body.credential ?? body.idToken) as string,
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

export { GoogleSignInController };
