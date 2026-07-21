import type { playerProfileCompletionMissingFields } from './player-profile-completion.constants';

type PlayerProfileCompletionMissingField =
  (typeof playerProfileCompletionMissingFields)[number];

type PlayerProfileCompletionState = 'missing' | 'incomplete' | 'complete';

type PlayerProfileCompletion = {
  state: PlayerProfileCompletionState;
  isComplete: boolean;
  missingFields: PlayerProfileCompletionMissingField[];
};

export type {
  PlayerProfileCompletion,
  PlayerProfileCompletionMissingField,
  PlayerProfileCompletionState,
};
