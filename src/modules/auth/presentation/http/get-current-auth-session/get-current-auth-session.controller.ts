import { Controller, Get, Headers, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { GetCurrentAuthSessionUseCase } from '../../../application/use-cases/get-current-auth-session/get-current-auth-session.use-case';
import { ApiAuthErrorResponses } from '../shared/api-auth-error-responses.decorator';
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
  @ApiAuthErrorResponses({
    unauthorized: ['invalid_access_token', 'auth_session_inactive'],
    forbidden: ['account_auth_forbidden'],
    includeRateLimit: true,
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
