type PrismaExternalIdentityRecord = {
  id: string;
  accountId: string;
  provider: 'GOOGLE';
  providerSubject: string;
  createdAt: Date;
};

export type { PrismaExternalIdentityRecord };
