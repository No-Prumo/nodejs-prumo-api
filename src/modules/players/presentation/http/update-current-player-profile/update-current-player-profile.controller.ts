import { Body, Controller, Headers, HttpStatus, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { ApiBearerAccessTokenHeader } from '@auth/presentation/http/shared/api-bearer-access-token-header.decorator';
import { readBearerToken } from '@auth/presentation/http/shared/bearer-token.helper';
import { ApiErrorResponses } from '@infra/http/openapi/api-error-responses.decorator';
import { UpdateCurrentPlayerProfileUseCase } from '../../../application/use-cases/update-current-player-profile/update-current-player-profile.use-case';
import { CurrentPlayerProfileResponseDto } from '../shared/player-profile-response.schemas';
import { toCurrentPlayerProfileResponse } from '../shared/player-profile-response.mapper';
import { UpdateCurrentPlayerProfileBodyDto } from './update-current-player-profile.schemas';

@ApiTags('Players')
@Controller('players')
class UpdateCurrentPlayerProfileController {
  constructor(
    private readonly updateCurrentPlayerProfile: UpdateCurrentPlayerProfileUseCase,
  ) {}

  @Patch('me')
  @ApiOperation({
    summary: 'Update current player profile',
    description:
      'Updates the authenticated player profile. The MVP contract keeps a single main sport.',
  })
  @ApiBearerAccessTokenHeader('Bearer access token for the current session.')
  @ApiErrorResponses({
    badRequest: ['validation_error'],
    unauthorized: ['invalid_access_token', 'auth_session_inactive'],
    forbidden: ['account_auth_forbidden'],
    notFound: ['resource_not_found'],
    tooManyRequests: ['rate_limited'],
    internalServerError: ['internal_error'],
  })
  @ZodResponse({
    status: HttpStatus.OK,
    description: 'Current player profile updated',
    type: CurrentPlayerProfileResponseDto,
  })
  async update(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Body() body: UpdateCurrentPlayerProfileBodyDto,
  ): Promise<CurrentPlayerProfileResponseDto> {
    const result = await this.updateCurrentPlayerProfile.execute({
      accessToken: readBearerToken(authorizationHeader) ?? '',
      displayName: body.displayName,
      mainSportCode: body.mainSportCode,
      mainSportLevel: body.mainSportLevel,
    });

    return toCurrentPlayerProfileResponse(result);
  }
}

export { UpdateCurrentPlayerProfileController };
