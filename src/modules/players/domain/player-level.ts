const playerLevels = ['beginner', 'intermediate', 'advanced'] as const;

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

type PlayerLevel = (typeof playerLevels)[number];

export { playerLevelCatalog, playerLevels };
export type { PlayerLevel };
