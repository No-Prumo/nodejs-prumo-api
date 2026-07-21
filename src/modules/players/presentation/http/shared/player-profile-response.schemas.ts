import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { playerProfileCompletionMissingFields } from '../../../application/services/player-profile-completion/player-profile-completion.constants';
import { playerLevels } from '../../../domain/player-level/player-level.constants';
import { mvpSportCodes } from '../../../domain/sport-code/sport-code.constants';

const SportCodeSchema = z.enum(mvpSportCodes).meta({ id: 'SportCode' });
const PlayerLevelSchema = z.enum(playerLevels).meta({ id: 'PlayerLevel' });

const PlayerProfileCompletionMissingFieldSchema = z
  .enum(playerProfileCompletionMissingFields)
  .meta({ id: 'PlayerProfileCompletionMissingField' });

const PlayerProfileCompletionSchema = z
  .object({
    state: z.enum(['missing', 'incomplete', 'complete']),
    isComplete: z.boolean(),
    missingFields: z.array(PlayerProfileCompletionMissingFieldSchema),
  })
  .meta({ id: 'PlayerProfileCompletionResponse' });

const PlayerProfileMainSportSchema = z
  .object({
    sportCode: SportCodeSchema,
    level: PlayerLevelSchema,
  })
  .meta({ id: 'PlayerProfileMainSportResponse' });

const PlayerProfileResponseSchema = z
  .object({
    id: z.string(),
    displayName: z.string().nullable(),
    mainSport: PlayerProfileMainSportSchema.nullable(),
    completion: PlayerProfileCompletionSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: 'PlayerProfileResponse' });

const CurrentPlayerProfileResponseSchema = z
  .object({
    profile: PlayerProfileResponseSchema.nullable(),
    completion: PlayerProfileCompletionSchema,
  })
  .meta({ id: 'CurrentPlayerProfileResponse' });

class CurrentPlayerProfileResponseDto extends createZodDto(
  CurrentPlayerProfileResponseSchema,
) {}

class PlayerProfileResponseDto extends createZodDto(
  PlayerProfileResponseSchema,
) {}

export {
  CurrentPlayerProfileResponseDto,
  CurrentPlayerProfileResponseSchema,
  PlayerLevelSchema,
  PlayerProfileCompletionSchema,
  PlayerProfileResponseDto,
  PlayerProfileResponseSchema,
  SportCodeSchema,
};
