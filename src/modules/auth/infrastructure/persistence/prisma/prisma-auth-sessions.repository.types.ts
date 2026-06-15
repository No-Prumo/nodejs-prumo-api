type PrismaAuthSessionRecord = {
  id: string;
  accountId: string;
  refreshTokenHash: string;
  refreshTokenFamilyId: string;
  creationSource: 'MAGIC_LINK' | 'GOOGLE' | 'PASSWORD';
  status: 'ACTIVE' | 'REVOKED';
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
  idleExpiresAt: Date;
  absoluteExpiresAt: Date;
  revokedAt: Date | null;
};

type PrismaAuthRefreshTokenRecord = {
  id: string;
  sessionId: string;
  refreshTokenFamilyId: string;
  tokenHash: string;
  status: 'ACTIVE' | 'ROTATED' | 'REVOKED';
  createdAt: Date;
  lastUsedAt: Date | null;
  rotatedAt: Date | null;
  revokedAt: Date | null;
  idleExpiresAt: Date;
  absoluteExpiresAt: Date;
  session: PrismaAuthSessionRecord;
};

export type { PrismaAuthRefreshTokenRecord, PrismaAuthSessionRecord };
