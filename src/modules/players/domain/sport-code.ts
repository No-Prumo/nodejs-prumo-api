const mvpSportCodes = [
  'futevolei',
  'beach_tennis',
  'beach_volleyball',
] as const;

const mvpSportsCatalog = [
  {
    code: 'futevolei',
    name: 'Futevolei',
  },
  {
    code: 'beach_tennis',
    name: 'Beach tennis',
  },
  {
    code: 'beach_volleyball',
    name: 'Beach volleyball',
  },
] as const satisfies readonly {
  code: SportCode;
  name: string;
}[];

type SportCode = (typeof mvpSportCodes)[number];

export { mvpSportCodes, mvpSportsCatalog };
export type { SportCode };
