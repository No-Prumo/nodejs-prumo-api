import type { AuthSessionCreationSource } from '../../domain/auth-session-creation-source';
import type { AuthSessionStatus } from '../../domain/auth-session-status';

const AUTH_SESSIONS_REPOSITORY = Symbol('AUTH_SESSIONS_REPOSITORY');

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

type AuthSessionsRepository = {
  create(data: CreateAuthSessionData): Promise<AuthSessionRecord>;
  findById(sessionId: string): Promise<AuthSessionRecord | null>;
  findRefreshTokenByHash(
    refreshTokenHash: string,
  ): Promise<AuthRefreshTokenRecord | null>;
  revokeActiveSessionsByAccountId(
    accountId: string,
    revokedAt: Date,
  ): Promise<number>;
  revokeRefreshTokenFamily(
    refreshTokenFamilyId: string,
    revokedAt: Date,
  ): Promise<void>;
  revokeSessionById(sessionId: string, revokedAt: Date): Promise<void>;
  rotateRefreshToken(
    data: RotateRefreshTokenData,
  ): Promise<AuthSessionRecord | null>;
};

export { AUTH_SESSIONS_REPOSITORY };
export type {
  AuthRefreshTokenRecord,
  AuthRefreshTokenStatus,
  AuthSessionRecord,
  AuthSessionsRepository,
  CreateAuthSessionData,
  RotateRefreshTokenData,
};
