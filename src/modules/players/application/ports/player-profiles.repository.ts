import type { PlayerLevel } from '../../domain/player-level';
import type { SportCode } from '../../domain/sport-code';

const PLAYER_PROFILES_REPOSITORY = Symbol('PLAYER_PROFILES_REPOSITORY');

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

type PlayerProfilesRepository = {
  create(data: CreatePlayerProfileData): Promise<PlayerProfileRecord>;
  findByAccountId(accountId: string): Promise<PlayerProfileRecord | null>;
  updateByAccountId(
    accountId: string,
    data: UpdatePlayerProfileData,
  ): Promise<PlayerProfileRecord>;
};

export { PLAYER_PROFILES_REPOSITORY };
export type {
  CreatePlayerProfileData,
  PlayerProfileRecord,
  PlayerProfilesRepository,
  UpdatePlayerProfileData,
};
