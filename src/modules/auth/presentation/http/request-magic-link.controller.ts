import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { RequestMagicLinkUseCase } from '../../application/use-cases/request-magic-link.use-case';
import {
  RequestMagicLinkBodyDto,
  RequestMagicLinkResponseDto,
} from './request-magic-link.schemas';

@ApiTags('Auth')
@Controller('auth/magic-link')
class RequestMagicLinkController {
  constructor(private readonly requestMagicLink: RequestMagicLinkUseCase) {}

  @Post('request')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Request magic link',
    description: 'Returns a generic success response for valid email input.',
  })
  @ZodResponse({
    status: 200,
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
