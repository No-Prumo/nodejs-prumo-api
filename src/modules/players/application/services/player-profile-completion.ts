import type { PlayerProfileRecord } from '../ports/player-profiles.repository';

const playerProfileCompletionMissingFields = [
  'displayName',
  'mainSportCode',
  'mainSportLevel',
] as const;

type PlayerProfileCompletionMissingField =
  (typeof playerProfileCompletionMissingFields)[number];

type PlayerProfileCompletionState = 'missing' | 'incomplete' | 'complete';

type PlayerProfileCompletion = {
  state: PlayerProfileCompletionState;
  isComplete: boolean;
  missingFields: PlayerProfileCompletionMissingField[];
};

function getPlayerProfileCompletion(
  profile: PlayerProfileRecord | null,
): PlayerProfileCompletion {
  if (!profile) {
    return {
      state: 'missing',
      isComplete: false,
      missingFields: [...playerProfileCompletionMissingFields],
    };
  }

  const missingFields: PlayerProfileCompletionMissingField[] = [];

  if (!profile.displayName || profile.displayName.trim().length === 0) {
    missingFields.push('displayName');
  }

  if (!profile.mainSportCode) {
    missingFields.push('mainSportCode');
  }

  if (!profile.mainSportLevel) {
    missingFields.push('mainSportLevel');
  }

  return {
    state: missingFields.length === 0 ? 'complete' : 'incomplete',
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

export { getPlayerProfileCompletion, playerProfileCompletionMissingFields };
export type {
  PlayerProfileCompletion,
  PlayerProfileCompletionMissingField,
  PlayerProfileCompletionState,
};
