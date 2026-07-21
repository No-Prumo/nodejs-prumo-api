import { Inject, Injectable } from '@nestjs/common';
import { GetCurrentAuthSessionUseCase } from '@auth/application/use-cases/get-current-auth-session/get-current-auth-session.use-case';
import {
  PLAYER_PROFILES_REPOSITORY,
  type PlayerProfilesRepository,
} from '../../ports/player-profiles.repository';
import { getPlayerProfileCompletion } from '../../services/player-profile-completion/player-profile-completion';
import type { CurrentPlayerProfileUseCaseResponse } from '../current-player-profile-response.types';
import type { GetCurrentPlayerProfileUseCaseRequest } from './get-current-player-profile.use-case.types';

@Injectable()
class GetCurrentPlayerProfileUseCase {
  constructor(
    private readonly getCurrentAuthSession: GetCurrentAuthSessionUseCase,
    @Inject(PLAYER_PROFILES_REPOSITORY)
    private readonly playerProfilesRepository: PlayerProfilesRepository,
  ) {}

  async execute(
    request: GetCurrentPlayerProfileUseCaseRequest,
  ): Promise<CurrentPlayerProfileUseCaseResponse> {
    const authSession = await this.getCurrentAuthSession.execute({
      accessToken: request.accessToken,
    });
    const profile = await this.playerProfilesRepository.findByAccountId(
      authSession.account.id,
    );

    return {
      profile,
      completion: getPlayerProfileCompletion(profile),
    };
  }
}

export { GetCurrentPlayerProfileUseCase };
