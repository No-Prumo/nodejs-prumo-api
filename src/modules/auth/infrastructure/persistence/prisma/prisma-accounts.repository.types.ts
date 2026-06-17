type PrismaAccountRecord = {
  id: string;
  email: string;
  normalizedEmail: string;
  displayName: string | null;
  status: 'ACTIVE' | 'BLOCKED' | 'DISABLED';
  createdAt: Date;
  updatedAt: Date;
};

export type { PrismaAccountRecord };
