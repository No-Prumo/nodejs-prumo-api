import type { PlayerProfileRecord } from '../ports/player-profiles.repository.types';
import type { PlayerProfileCompletion } from '../services/player-profile-completion/player-profile-completion.types';

type CurrentPlayerProfileUseCaseResponse = {
  profile: PlayerProfileRecord | null;
  completion: PlayerProfileCompletion;
};

export type { CurrentPlayerProfileUseCaseResponse };
