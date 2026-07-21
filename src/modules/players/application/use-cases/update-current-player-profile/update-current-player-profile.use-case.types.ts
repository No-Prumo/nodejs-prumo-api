import type { PlayerLevel } from '../../../domain/player-level/player-level.types';
import type { SportCode } from '../../../domain/sport-code/sport-code.types';

type UpdateCurrentPlayerProfileUseCaseRequest = {
  accessToken: string;
  displayName?: string;
  mainSportCode?: SportCode;
  mainSportLevel?: PlayerLevel;
};

export type { UpdateCurrentPlayerProfileUseCaseRequest };
