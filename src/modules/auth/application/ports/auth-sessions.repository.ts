import type {
  AuthRefreshTokenRecord,
  AuthSessionRecord,
  CreateAuthSessionData,
  RotateRefreshTokenData,
} from './auth-sessions.repository.types';

const AUTH_SESSIONS_REPOSITORY = Symbol('AUTH_SESSIONS_REPOSITORY');

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
export type { AuthSessionsRepository };
