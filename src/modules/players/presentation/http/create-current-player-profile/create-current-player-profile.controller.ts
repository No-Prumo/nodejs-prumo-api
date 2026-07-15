import { Body, Controller, Headers, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { ApiBearerAccessTokenHeader } from '@auth/presentation/http/shared/api-bearer-access-token-header.decorator';
import { readBearerToken } from '@auth/presentation/http/shared/bearer-token.helper';
import { ApiErrorResponses } from '@infra/http/openapi/api-error-responses.decorator';
import { CreateCurrentPlayerProfileUseCase } from '../../../application/use-cases/create-current-player-profile/create-current-player-profile.use-case';
import { CurrentPlayerProfileResponseDto } from '../shared/player-profile-response.schemas';
import { toCurrentPlayerProfileResponse } from '../shared/player-profile-response.mapper';
import { CreateCurrentPlayerProfileBodyDto } from './create-current-player-profile.schemas';

@ApiTags('Players')
@Controller('players')
class CreateCurrentPlayerProfileController {
  constructor(
    private readonly createCurrentPlayerProfile: CreateCurrentPlayerProfileUseCase,
  ) {}

  @Post('me')
  @ApiOperation({
    summary: 'Create current player profile',
    description:
      'Creates the authenticated player profile with exactly one MVP main sport.',
  })
  @ApiBearerAccessTokenHeader('Bearer access token for the current session.')
  @ApiErrorResponses({
    badRequest: ['validation_error'],
    unauthorized: ['invalid_access_token', 'auth_session_inactive'],
    forbidden: ['account_auth_forbidden'],
    conflict: ['conflict'],
    tooManyRequests: ['rate_limited'],
    internalServerError: ['internal_error'],
  })
  @ZodResponse({
    status: HttpStatus.CREATED,
    description: 'Current player profile created',
    type: CurrentPlayerProfileResponseDto,
  })
  async create(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Body() body: CreateCurrentPlayerProfileBodyDto,
  ): Promise<CurrentPlayerProfileResponseDto> {
    const result = await this.createCurrentPlayerProfile.execute({
      accessToken: readBearerToken(authorizationHeader) ?? '',
      displayName: body.displayName,
      mainSportCode: body.mainSportCode,
      mainSportLevel: body.mainSportLevel,
    });

    return toCurrentPlayerProfileResponse(result);
  }
}

export { CreateCurrentPlayerProfileController };
