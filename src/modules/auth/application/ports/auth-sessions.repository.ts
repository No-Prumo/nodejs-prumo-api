import type { AuthSessionCreationSource } from '../../domain/auth-session-creation-source';
import type { AuthSessionStatus } from '../../domain/auth-session-status';

const AUTH_SESSIONS_REPOSITORY = Symbol('AUTH_SESSIONS_REPOSITORY');

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

type AuthSessionsRepository = {
  create(data: CreateAuthSessionData): Promise<AuthSessionRecord>;
  findActiveByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<AuthSessionRecord | null>;
};

export { AUTH_SESSIONS_REPOSITORY };
export type {
  AuthSessionRecord,
  AuthSessionsRepository,
  CreateAuthSessionData,
};
