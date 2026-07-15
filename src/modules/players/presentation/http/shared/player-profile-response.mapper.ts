import { getPlayerProfileCompletion } from '../../../application/services/player-profile-completion';
import type { CurrentPlayerProfileUseCaseResponse } from '../../../application/use-cases/current-player-profile-response.types';
import type { PlayerProfileRecord } from '../../../application/ports/player-profiles.repository';
import type {
  CurrentPlayerProfileResponseDto,
  PlayerProfileResponseDto,
} from './player-profile-response.schemas';

function toCurrentPlayerProfileResponse(
  result: CurrentPlayerProfileUseCaseResponse,
): CurrentPlayerProfileResponseDto {
  return {
    profile: result.profile ? toPlayerProfileResponse(result.profile) : null,
    completion: result.completion,
  };
}

function toPlayerProfileResponse(
  profile: PlayerProfileRecord,
): PlayerProfileResponseDto {
  const completion = getPlayerProfileCompletion(profile);

  return {
    id: profile.id,
    displayName: profile.displayName,
    mainSport:
      profile.mainSportCode && profile.mainSportLevel
        ? {
            sportCode: profile.mainSportCode,
            level: profile.mainSportLevel,
          }
        : null,
    completion,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export { toCurrentPlayerProfileResponse, toPlayerProfileResponse };
