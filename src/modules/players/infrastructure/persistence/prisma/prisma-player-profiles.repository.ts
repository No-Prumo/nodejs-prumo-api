import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import {
  currentPlayerProfileAlreadyExists,
  currentPlayerProfileNotFound,
} from '../../../application/errors/player-profile-errors';
import type { PlayerProfilesRepository } from '../../../application/ports/player-profiles.repository';
import type {
  CreatePlayerProfileData,
  PlayerProfileRecord,
  UpdatePlayerProfileData,
} from '../../../application/ports/player-profiles.repository.types';
import {
  isRecordNotFoundError,
  isUniqueConstraintError,
} from './prisma-player-profiles.repository.helpers';
import {
  mapPlayerLevelToPrisma,
  mapPlayerProfile,
} from './prisma-player-profiles.repository.mapper';

@Injectable()
class PrismaPlayerProfilesRepository implements PlayerProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePlayerProfileData): Promise<PlayerProfileRecord> {
    try {
      const profile = await this.prisma.playerProfile.create({
        data: {
          accountId: data.accountId,
          displayName: data.displayName,
          mainSportCode: data.mainSportCode,
          mainSportLevel: mapPlayerLevelToPrisma(data.mainSportLevel),
        },
      });

      return mapPlayerProfile(profile);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw currentPlayerProfileAlreadyExists({
          accountId: data.accountId,
          action: 'create_player_profile',
          cause: error,
          reason: 'unique_constraint_violation',
        });
      }

      throw error;
    }
  }

  async findByAccountId(
    accountId: string,
  ): Promise<PlayerProfileRecord | null> {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { accountId },
    });

    return profile ? mapPlayerProfile(profile) : null;
  }

  async updateByAccountId(
    accountId: string,
    data: UpdatePlayerProfileData,
  ): Promise<PlayerProfileRecord> {
    try {
      const profile = await this.prisma.playerProfile.update({
        where: { accountId },
        data: {
          displayName: data.displayName,
          mainSportCode: data.mainSportCode,
          mainSportLevel:
            data.mainSportLevel === undefined
              ? undefined
              : mapPlayerLevelToPrisma(data.mainSportLevel),
        },
      });

      return mapPlayerProfile(profile);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw currentPlayerProfileNotFound({
          accountId,
          action: 'update_player_profile',
          cause: error,
          reason: 'profile_missing',
        });
      }

      throw error;
    }
  }
}

export { PrismaPlayerProfilesRepository };
