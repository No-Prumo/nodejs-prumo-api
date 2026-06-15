import type {
  AuthRefreshTokenRecord,
  AuthSessionRecord,
  AuthSessionsRepository,
  CreateAuthSessionData,
  RotateRefreshTokenData,
} from '../../../application/ports/auth-sessions.repository';

class InMemoryAuthSessionsRepository implements AuthSessionsRepository {
  readonly authSessions: AuthSessionRecord[] = [];
  readonly refreshTokens: AuthRefreshTokenRecord[] = [];

  create(data: CreateAuthSessionData): Promise<AuthSessionRecord> {
    const now = new Date();
    const authSession: AuthSessionRecord = {
      id: crypto.randomUUID(),
      accountId: data.accountId,
      refreshTokenHash: data.refreshTokenHash,
      refreshTokenFamilyId: data.refreshTokenFamilyId,
      creationSource: data.creationSource,
      status: 'active',
      userAgent: data.userAgent ?? null,
      ipAddress: data.ipAddress ?? null,
      createdAt: now,
      updatedAt: now,
      lastUsedAt: null,
      idleExpiresAt: data.idleExpiresAt,
      absoluteExpiresAt: data.absoluteExpiresAt,
      revokedAt: null,
    };

    this.authSessions.push(authSession);
    this.refreshTokens.push({
      id: crypto.randomUUID(),
      sessionId: authSession.id,
      refreshTokenFamilyId: data.refreshTokenFamilyId,
      tokenHash: data.refreshTokenHash,
      status: 'active',
      createdAt: now,
      lastUsedAt: null,
      rotatedAt: null,
      revokedAt: null,
      idleExpiresAt: data.idleExpiresAt,
      absoluteExpiresAt: data.absoluteExpiresAt,
      session: authSession,
    });

    return Promise.resolve(authSession);
  }

  findRefreshTokenByHash(
    refreshTokenHash: string,
  ): Promise<AuthRefreshTokenRecord | null> {
    return Promise.resolve(
      this.refreshTokens.find(
        (token) => token.tokenHash === refreshTokenHash,
      ) ?? null,
    );
  }

  revokeActiveSessionsByAccountId(
    accountId: string,
    revokedAt: Date,
  ): Promise<number> {
    const sessions = this.authSessions.filter(
      (session) =>
        session.accountId === accountId &&
        session.status === 'active' &&
        session.revokedAt === null,
    );

    for (const session of sessions) {
      session.status = 'revoked';
      session.revokedAt = revokedAt;
      session.updatedAt = revokedAt;
      this.revokeTokensBySessionId(session.id, revokedAt);
    }

    return Promise.resolve(sessions.length);
  }

  revokeRefreshTokenFamily(
    refreshTokenFamilyId: string,
    revokedAt: Date,
  ): Promise<void> {
    for (const session of this.authSessions) {
      if (
        session.refreshTokenFamilyId === refreshTokenFamilyId &&
        session.status === 'active'
      ) {
        session.status = 'revoked';
        session.revokedAt = revokedAt;
        session.updatedAt = revokedAt;
      }
    }

    for (const token of this.refreshTokens) {
      if (token.refreshTokenFamilyId === refreshTokenFamilyId) {
        token.status = 'revoked';
        token.revokedAt = revokedAt;
      }
    }

    return Promise.resolve();
  }

  revokeSessionById(sessionId: string, revokedAt: Date): Promise<void> {
    const session = this.authSessions.find(
      (authSession) => authSession.id === sessionId,
    );

    if (session) {
      session.status = 'revoked';
      session.revokedAt = revokedAt;
      session.updatedAt = revokedAt;
    }

    this.revokeTokensBySessionId(sessionId, revokedAt);

    return Promise.resolve();
  }

  rotateRefreshToken(
    data: RotateRefreshTokenData,
  ): Promise<AuthSessionRecord | null> {
    const previousToken = this.refreshTokens.find(
      (token) =>
        token.sessionId === data.sessionId &&
        token.tokenHash === data.previousRefreshTokenHash &&
        token.status === 'active' &&
        token.revokedAt === null,
    );
    const session = this.authSessions.find(
      (authSession) => authSession.id === data.sessionId,
    );

    if (!previousToken || !session) {
      return Promise.resolve(null);
    }

    previousToken.status = 'rotated';
    previousToken.lastUsedAt = data.usedAt;
    previousToken.rotatedAt = data.usedAt;

    session.refreshTokenHash = data.nextRefreshTokenHash;
    session.idleExpiresAt = data.nextIdleExpiresAt;
    session.lastUsedAt = data.usedAt;
    session.updatedAt = data.usedAt;

    this.refreshTokens.push({
      id: crypto.randomUUID(),
      sessionId: session.id,
      refreshTokenFamilyId: data.refreshTokenFamilyId,
      tokenHash: data.nextRefreshTokenHash,
      status: 'active',
      createdAt: data.usedAt,
      lastUsedAt: null,
      rotatedAt: null,
      revokedAt: null,
      idleExpiresAt: data.nextIdleExpiresAt,
      absoluteExpiresAt: data.absoluteExpiresAt,
      session,
    });

    return Promise.resolve(session);
  }

  private revokeTokensBySessionId(sessionId: string, revokedAt: Date) {
    for (const token of this.refreshTokens) {
      if (token.sessionId === sessionId && token.revokedAt === null) {
        token.status = 'revoked';
        token.revokedAt = revokedAt;
      }
    }
  }
}

export { InMemoryAuthSessionsRepository };
