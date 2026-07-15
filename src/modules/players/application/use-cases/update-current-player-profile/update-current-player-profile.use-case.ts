import { Inject, Injectable } from '@nestjs/common';
import { GetCurrentAuthSessionUseCase } from '@auth/application/use-cases/get-current-auth-session/get-current-auth-session.use-case';
import { currentPlayerProfileNotFound } from '../../errors/player-profile-errors';
import {
  PLAYER_PROFILES_REPOSITORY,
  type PlayerProfilesRepository,
} from '../../ports/player-profiles.repository';
import { getPlayerProfileCompletion } from '../../services/player-profile-completion';
import type { CurrentPlayerProfileUseCaseResponse } from '../current-player-profile-response.types';
import type { UpdateCurrentPlayerProfileUseCaseRequest } from './update-current-player-profile.use-case.types';

@Injectable()
class UpdateCurrentPlayerProfileUseCase {
  constructor(
    private readonly getCurrentAuthSession: GetCurrentAuthSessionUseCase,
    @Inject(PLAYER_PROFILES_REPOSITORY)
    private readonly playerProfilesRepository: PlayerProfilesRepository,
  ) {}

  async execute(
    request: UpdateCurrentPlayerProfileUseCaseRequest,
  ): Promise<CurrentPlayerProfileUseCaseResponse> {
    const authSession = await this.getCurrentAuthSession.execute({
      accessToken: request.accessToken,
    });
    const existingProfile = await this.playerProfilesRepository.findByAccountId(
      authSession.account.id,
    );

    if (!existingProfile) {
      throw currentPlayerProfileNotFound({
        accountId: authSession.account.id,
        action: 'update_current_player_profile',
        reason: 'profile_missing',
      });
    }

    const profile = await this.playerProfilesRepository.updateByAccountId(
      authSession.account.id,
      {
        displayName: request.displayName,
        mainSportCode: request.mainSportCode,
        mainSportLevel: request.mainSportLevel,
      },
    );

    return {
      profile,
      completion: getPlayerProfileCompletion(profile),
    };
  }
}

export { UpdateCurrentPlayerProfileUseCase };
