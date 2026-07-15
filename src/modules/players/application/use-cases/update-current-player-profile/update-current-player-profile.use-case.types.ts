import type { PlayerLevel } from '../../../domain/player-level';
import type { SportCode } from '../../../domain/sport-code';

type UpdateCurrentPlayerProfileUseCaseRequest = {
  accessToken: string;
  displayName?: string;
  mainSportCode?: SportCode;
  mainSportLevel?: PlayerLevel;
};

export type { UpdateCurrentPlayerProfileUseCaseRequest };
