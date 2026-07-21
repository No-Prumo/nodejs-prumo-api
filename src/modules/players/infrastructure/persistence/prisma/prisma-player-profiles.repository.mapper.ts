import type { PlayerProfileRecord } from '../../../application/ports/player-profiles.repository.types';
import type { PlayerLevel } from '../../../domain/player-level/player-level.types';
import type { SportCode } from '../../../domain/sport-code/sport-code.types';
import type {
  PrismaPlayerLevel,
  PrismaPlayerProfileRecord,
} from './prisma-player-profiles.repository.types';

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

export { mapPlayerLevelFromPrisma, mapPlayerLevelToPrisma, mapPlayerProfile };
