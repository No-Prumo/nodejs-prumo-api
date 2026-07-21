import type { SportCode } from './sport-code.types';

const mvpSportCodes = [
  'futevolei',
  'beach_tennis',
  'beach_volleyball',
] as const satisfies readonly SportCode[];

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

export { mvpSportCodes, mvpSportsCatalog };
