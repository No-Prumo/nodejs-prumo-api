import type { AuthSessionCreationSource } from '../../domain/auth-session-creation-source';
import type { AuthSessionStatus } from '../../domain/auth-session-status';

type AuthRefreshTokenStatus = 'active' | 'rotated' | 'revoked';

type AuthSessionRecord = {
  id: string;
  accountId: string;
  refreshTokenHash: string;
  refreshTokenFamilyId: string;
  creationSource: AuthSessionCreationSource;
  status: AuthSessionStatus;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
  idleExpiresAt: Date;
  absoluteExpiresAt: Date;
  revokedAt: Date | null;
};

type AuthRefreshTokenRecord = {
  id: string;
  sessionId: string;
  refreshTokenFamilyId: string;
  tokenHash: string;
  status: AuthRefreshTokenStatus;
  createdAt: Date;
  lastUsedAt: Date | null;
  rotatedAt: Date | null;
  revokedAt: Date | null;
  idleExpiresAt: Date;
  absoluteExpiresAt: Date;
  session: AuthSessionRecord;
};

type CreateAuthSessionData = {
  accountId: string;
  refreshTokenHash: string;
  refreshTokenFamilyId: string;
  creationSource: AuthSessionCreationSource;
  userAgent?: string | null;
  ipAddress?: string | null;
  idleExpiresAt: Date;
  absoluteExpiresAt: Date;
};

type RotateRefreshTokenData = {
  sessionId: string;
  refreshTokenFamilyId: string;
  previousRefreshTokenHash: string;
  nextRefreshTokenHash: string;
  nextIdleExpiresAt: Date;
  absoluteExpiresAt: Date;
  usedAt: Date;
};

export type {
  AuthRefreshTokenRecord,
  AuthRefreshTokenStatus,
  AuthSessionRecord,
  CreateAuthSessionData,
  RotateRefreshTokenData,
};
