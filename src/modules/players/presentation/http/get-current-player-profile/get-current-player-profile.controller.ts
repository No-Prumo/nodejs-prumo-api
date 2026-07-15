import { Controller, Get, Headers, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { ApiBearerAccessTokenHeader } from '@auth/presentation/http/shared/api-bearer-access-token-header.decorator';
import { readBearerToken } from '@auth/presentation/http/shared/bearer-token.helper';
import { ApiErrorResponses } from '@infra/http/openapi/api-error-responses.decorator';
import { GetCurrentPlayerProfileUseCase } from '../../../application/use-cases/get-current-player-profile/get-current-player-profile.use-case';
import { CurrentPlayerProfileResponseDto } from '../shared/player-profile-response.schemas';
import { toCurrentPlayerProfileResponse } from '../shared/player-profile-response.mapper';

@ApiTags('Players')
@Controller('players')
class GetCurrentPlayerProfileController {
  constructor(
    private readonly getCurrentPlayerProfile: GetCurrentPlayerProfileUseCase,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current player profile',
    description:
      'Returns the authenticated player profile and completion state for post-login routing.',
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
    description: 'Current player profile and completion state',
    type: CurrentPlayerProfileResponseDto,
  })
  async getCurrentProfile(
    @Headers('authorization') authorizationHeader: string | undefined,
  ): Promise<CurrentPlayerProfileResponseDto> {
    const result = await this.getCurrentPlayerProfile.execute({
      accessToken: readBearerToken(authorizationHeader) ?? '',
    });

    return toCurrentPlayerProfileResponse(result);
  }
}

export { GetCurrentPlayerProfileController };
