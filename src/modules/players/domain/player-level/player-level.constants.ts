import type { PlayerLevel } from './player-level.types';

const playerLevels = [
  'beginner',
  'intermediate',
  'advanced',
] as const satisfies readonly PlayerLevel[];

const playerLevelCatalog = [
  {
    code: 'beginner',
    name: 'Beginner',
  },
  {
    code: 'intermediate',
    name: 'Intermediate',
  },
  {
    code: 'advanced',
    name: 'Advanced',
  },
] as const satisfies readonly {
  code: PlayerLevel;
  name: string;
}[];

export { playerLevelCatalog, playerLevels };
