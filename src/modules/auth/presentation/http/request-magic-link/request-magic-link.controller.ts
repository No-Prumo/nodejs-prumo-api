import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ZodResponse } from 'nestjs-zod';
import { RequestMagicLinkUseCase } from '../../../application/use-cases/request-magic-link/request-magic-link.use-case';
import {
  authRateLimitWindowMilliseconds,
  requestMagicLinkRateLimit,
} from '../shared/auth-http-rate-limit.constants';
import {
  RequestMagicLinkBodyDto,
  RequestMagicLinkResponseDto,
} from './request-magic-link.schemas';

@ApiTags('Auth')
@Controller('auth/magic-link')
class RequestMagicLinkController {
  constructor(private readonly requestMagicLink: RequestMagicLinkUseCase) {}

  @Post('request')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: requestMagicLinkRateLimit,
      ttl: authRateLimitWindowMilliseconds,
    },
  })
  @ApiOperation({
    summary: 'Request magic link',
    description: 'Returns a generic success response for valid email input.',
  })
  @ZodResponse({
    status: HttpStatus.OK,
    description: 'Generic magic link request response',
    type: RequestMagicLinkResponseDto,
  })
  request(
    @Body() body: RequestMagicLinkBodyDto,
  ): Promise<RequestMagicLinkResponseDto> {
    return this.requestMagicLink.execute({
      email: body.email,
    });
  }
}

export { RequestMagicLinkController };
