import type {
  CreatePlayerProfileData,
  PlayerProfileRecord,
  UpdatePlayerProfileData,
} from './player-profiles.repository.types';

const PLAYER_PROFILES_REPOSITORY = Symbol('PLAYER_PROFILES_REPOSITORY');

type PlayerProfilesRepository = {
  create(data: CreatePlayerProfileData): Promise<PlayerProfileRecord>;
  findByAccountId(accountId: string): Promise<PlayerProfileRecord | null>;
  updateByAccountId(
    accountId: string,
    data: UpdatePlayerProfileData,
  ): Promise<PlayerProfileRecord>;
};

export { PLAYER_PROFILES_REPOSITORY };
export type { PlayerProfilesRepository };
