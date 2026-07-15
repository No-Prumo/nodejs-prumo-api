import type { PlayerProfileCompletion } from '../services/player-profile-completion';
import type { PlayerProfileRecord } from '../ports/player-profiles.repository';

type CurrentPlayerProfileUseCaseResponse = {
  profile: PlayerProfileRecord | null;
  completion: PlayerProfileCompletion;
};

export type { CurrentPlayerProfileUseCaseResponse };
