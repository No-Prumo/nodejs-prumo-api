import { currentPlayerProfileAlreadyExists } from '../../../application/errors/player-profile-errors';
import type {
  CreatePlayerProfileData,
  PlayerProfileRecord,
  PlayerProfilesRepository,
  UpdatePlayerProfileData,
} from '../../../application/ports/player-profiles.repository';

class InMemoryPlayerProfilesRepository implements PlayerProfilesRepository {
  readonly profiles: PlayerProfileRecord[] = [];

  async create(data: CreatePlayerProfileData): Promise<PlayerProfileRecord> {
    const existingProfile = await this.findByAccountId(data.accountId);

    if (existingProfile) {
      throw currentPlayerProfileAlreadyExists({
        accountId: data.accountId,
        action: 'create_player_profile',
        reason: 'profile_already_exists',
      });
    }

    const now = new Date();
    const profile: PlayerProfileRecord = {
      id: `player-profile-${this.profiles.length + 1}`,
      accountId: data.accountId,
      displayName: data.displayName,
      mainSportCode: data.mainSportCode,
      mainSportLevel: data.mainSportLevel,
      createdAt: now,
      updatedAt: now,
    };

    this.profiles.push(profile);

    return profile;
  }

  findByAccountId(accountId: string): Promise<PlayerProfileRecord | null> {
    return Promise.resolve(
      this.profiles.find((profile) => profile.accountId === accountId) ?? null,
    );
  }

  async updateByAccountId(
    accountId: string,
    data: UpdatePlayerProfileData,
  ): Promise<PlayerProfileRecord> {
    const profile = await this.findByAccountId(accountId);

    if (!profile) {
      throw new Error('Player profile not found');
    }

    if (data.displayName !== undefined) {
      profile.displayName = data.displayName;
    }

    if (data.mainSportCode !== undefined) {
      profile.mainSportCode = data.mainSportCode;
    }

    if (data.mainSportLevel !== undefined) {
      profile.mainSportLevel = data.mainSportLevel;
    }

    profile.updatedAt = new Date();

    return profile;
  }
}

export { InMemoryPlayerProfilesRepository };
