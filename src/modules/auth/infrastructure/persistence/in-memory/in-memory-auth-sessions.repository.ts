import type {
  AuthSessionRecord,
  AuthSessionsRepository,
  CreateAuthSessionData,
} from '../../../application/ports/auth-sessions.repository';

class InMemoryAuthSessionsRepository implements AuthSessionsRepository {
  readonly authSessions: AuthSessionRecord[] = [];

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

    return Promise.resolve(authSession);
  }

  findActiveByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<AuthSessionRecord | null> {
    const now = new Date();

    return Promise.resolve(
      this.authSessions.find(
        (session) =>
          session.refreshTokenHash === refreshTokenHash &&
          session.status === 'active' &&
          session.revokedAt === null &&
          session.idleExpiresAt > now &&
          session.absoluteExpiresAt > now,
      ) ?? null,
    );
  }
}

export { InMemoryAuthSessionsRepository };
