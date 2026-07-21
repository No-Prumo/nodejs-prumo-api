import type { PlayerLevel } from '../../domain/player-level/player-level.types';
import type { SportCode } from '../../domain/sport-code/sport-code.types';

type PlayerProfileRecord = {
  id: string;
  accountId: string;
  displayName: string | null;
  mainSportCode: SportCode | null;
  mainSportLevel: PlayerLevel | null;
  createdAt: Date;
  updatedAt: Date;
};

type CreatePlayerProfileData = {
  accountId: string;
  displayName: string;
  mainSportCode: SportCode;
  mainSportLevel: PlayerLevel;
};

type UpdatePlayerProfileData = {
  displayName?: string;
  mainSportCode?: SportCode;
  mainSportLevel?: PlayerLevel;
};

export type {
  CreatePlayerProfileData,
  PlayerProfileRecord,
  UpdatePlayerProfileData,
};
