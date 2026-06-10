import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Inject,
  Ip,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { ZodResponse } from 'nestjs-zod';
import { authConfig, type AuthConfig } from '../../../../../config';
import { ConsumeMagicLinkUseCase } from '../../../application/use-cases/consume-magic-link/consume-magic-link.use-case';
import { buildRefreshTokenCookieOptions } from '../shared/auth-cookie.helper';
import {
  ConsumeMagicLinkBodyDto,
  ConsumeMagicLinkResponseDto,
} from './consume-magic-link.schemas';

@ApiTags('Auth')
@Controller('auth/magic-link')
class ConsumeMagicLinkController {
  constructor(
    private readonly consumeMagicLink: ConsumeMagicLinkUseCase,
    @Inject(authConfig.KEY)
    private readonly authSettings: AuthConfig,
  ) {}

  @Post('consume')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 15 * 60 * 1000 } })
  @ApiOperation({
    summary: 'Consume magic link',
    description: 'Consumes a one-time token and creates an auth session.',
  })
  @ZodResponse({
    status: 200,
    description: 'Authenticated session response',
    type: ConsumeMagicLinkResponseDto,
  })
  async consume(
    @Body() body: ConsumeMagicLinkBodyDto,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ipAddress: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ConsumeMagicLinkResponseDto> {
    const result = await this.consumeMagicLink.execute({
      token: body.token,
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

export { ConsumeMagicLinkController };
