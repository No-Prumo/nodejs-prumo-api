import { Controller, Get, Headers, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { ApiErrorResponses } from '@infra/http/openapi/api-error-responses.decorator';
import { GetCurrentAuthSessionUseCase } from '../../../application/use-cases/get-current-auth-session/get-current-auth-session.use-case';
import { ApiBearerAccessTokenHeader } from '../shared/api-bearer-access-token-header.decorator';
import { readBearerToken } from '../shared/bearer-token.helper';
import { GetCurrentAuthSessionResponseDto } from './get-current-auth-session.schemas';

@ApiTags('Auth')
@Controller('auth')
class GetCurrentAuthSessionController {
  constructor(
    private readonly getCurrentAuthSession: GetCurrentAuthSessionUseCase,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current auth session',
    description:
      'Returns the authenticated account and active auth session for a Bearer access token.',
  })
  @ApiBearerAccessTokenHeader('Bearer access token for the current session.')
  @ApiErrorResponses({
    unauthorized: ['invalid_access_token', 'auth_session_inactive'],
    forbidden: ['account_auth_forbidden'],
    tooManyRequests: ['rate_limited'],
    internalServerError: ['internal_error'],
  })
  @ZodResponse({
    status: HttpStatus.OK,
    description: 'Current authenticated account and session response',
    type: GetCurrentAuthSessionResponseDto,
  })
  getCurrentSession(
    @Headers('authorization') authorizationHeader: string | undefined,
  ): Promise<GetCurrentAuthSessionResponseDto> {
    return this.getCurrentAuthSession.execute({
      accessToken: readBearerToken(authorizationHeader) ?? '',
    });
  }
}

export { GetCurrentAuthSessionController };
