type PrismaPlayerLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

type PrismaPlayerProfileRecord = {
  id: string;
  accountId: string;
  displayName: string | null;
  mainSportCode: string | null;
  mainSportLevel: PrismaPlayerLevel | null;
  createdAt: Date;
  updatedAt: Date;
};

export type { PrismaPlayerLevel, PrismaPlayerProfileRecord };
