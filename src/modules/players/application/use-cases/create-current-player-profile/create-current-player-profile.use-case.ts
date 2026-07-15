import { Inject, Injectable } from '@nestjs/common';
import { GetCurrentAuthSessionUseCase } from '@auth/application/use-cases/get-current-auth-session/get-current-auth-session.use-case';
import { currentPlayerProfileAlreadyExists } from '../../errors/player-profile-errors';
import {
  PLAYER_PROFILES_REPOSITORY,
  type PlayerProfilesRepository,
} from '../../ports/player-profiles.repository';
import { getPlayerProfileCompletion } from '../../services/player-profile-completion';
import type { CurrentPlayerProfileUseCaseResponse } from '../current-player-profile-response.types';
import type { CreateCurrentPlayerProfileUseCaseRequest } from './create-current-player-profile.use-case.types';

@Injectable()
class CreateCurrentPlayerProfileUseCase {
  constructor(
    private readonly getCurrentAuthSession: GetCurrentAuthSessionUseCase,
    @Inject(PLAYER_PROFILES_REPOSITORY)
    private readonly playerProfilesRepository: PlayerProfilesRepository,
  ) {}

  async execute(
    request: CreateCurrentPlayerProfileUseCaseRequest,
  ): Promise<CurrentPlayerProfileUseCaseResponse> {
    const authSession = await this.getCurrentAuthSession.execute({
      accessToken: request.accessToken,
    });
    const existingProfile = await this.playerProfilesRepository.findByAccountId(
      authSession.account.id,
    );

    if (existingProfile) {
      throw currentPlayerProfileAlreadyExists({
        accountId: authSession.account.id,
        action: 'create_current_player_profile',
        reason: 'profile_already_exists',
      });
    }

    const profile = await this.playerProfilesRepository.create({
      accountId: authSession.account.id,
      displayName: request.displayName,
      mainSportCode: request.mainSportCode,
      mainSportLevel: request.mainSportLevel,
    });

    return {
      profile,
      completion: getPlayerProfileCompletion(profile),
    };
  }
}

export { CreateCurrentPlayerProfileUseCase };
