import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ZodResponse } from 'nestjs-zod';
import { ApiErrorResponses } from '@infra/http/openapi/api-error-responses.decorator';
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
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({
    default: {
      limit: requestMagicLinkRateLimit,
      ttl: authRateLimitWindowMilliseconds,
    },
  })
  @ApiOperation({
    summary: 'Request magic link',
    description:
      'Accepts a magic link request without revealing account existence.',
  })
  @ApiErrorResponses({
    badRequest: ['validation_error'],
    tooManyRequests: ['rate_limited'],
    serviceUnavailable: ['email_delivery_unavailable'],
    internalServerError: ['internal_error'],
  })
  @ZodResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Magic link request accepted',
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
