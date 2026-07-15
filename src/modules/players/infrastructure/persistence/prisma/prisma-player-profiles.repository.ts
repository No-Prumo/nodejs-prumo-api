import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import {
  currentPlayerProfileAlreadyExists,
  currentPlayerProfileNotFound,
} from '../../../application/errors/player-profile-errors';
import type {
  CreatePlayerProfileData,
  PlayerProfileRecord,
  PlayerProfilesRepository,
  UpdatePlayerProfileData,
} from '../../../application/ports/player-profiles.repository';
import type { PlayerLevel } from '../../../domain/player-level';
import type { SportCode } from '../../../domain/sport-code';
import type {
  PrismaPlayerLevel,
  PrismaPlayerProfileRecord,
} from './prisma-player-profiles.repository.types';

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

function mapPlayerProfile(
  profile: PrismaPlayerProfileRecord,
): PlayerProfileRecord {
  return {
    id: profile.id,
    accountId: profile.accountId,
    displayName: profile.displayName,
    mainSportCode: profile.mainSportCode as SportCode | null,
    mainSportLevel: profile.mainSportLevel
      ? mapPlayerLevelFromPrisma(profile.mainSportLevel)
      : null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

function mapPlayerLevelToPrisma(level: PlayerLevel): PrismaPlayerLevel {
  return level.toUpperCase() as PrismaPlayerLevel;
}

function mapPlayerLevelFromPrisma(level: PrismaPlayerLevel): PlayerLevel {
  return level.toLowerCase() as PlayerLevel;
}

function isUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function isRecordNotFoundError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  );
}

export { PrismaPlayerProfilesRepository };
