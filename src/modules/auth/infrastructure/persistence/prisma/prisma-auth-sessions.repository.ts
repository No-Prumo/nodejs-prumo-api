import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infra/prisma/prisma.service';
import type {
  AuthRefreshTokenRecord,
  AuthSessionRecord,
  AuthSessionsRepository,
  CreateAuthSessionData,
  RotateRefreshTokenData,
} from '../../../application/ports/auth-sessions.repository';
import type {
  PrismaAuthRefreshTokenRecord,
  PrismaAuthSessionRecord,
} from './prisma-auth-sessions.repository.types';

@Injectable()
class PrismaAuthSessionsRepository implements AuthSessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuthSessionData): Promise<AuthSessionRecord> {
    const session = await this.prisma.$transaction(async (tx) => {
      const createdSession = await tx.authSession.create({
        data: {
          accountId: data.accountId,
          refreshTokenHash: data.refreshTokenHash,
          refreshTokenFamilyId: data.refreshTokenFamilyId,
          creationSource: this.mapCreationSourceToPrisma(data.creationSource),
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          idleExpiresAt: data.idleExpiresAt,
          absoluteExpiresAt: data.absoluteExpiresAt,
        },
      });

      await tx.authRefreshToken.create({
        data: {
          sessionId: createdSession.id,
          refreshTokenFamilyId: data.refreshTokenFamilyId,
          tokenHash: data.refreshTokenHash,
          idleExpiresAt: data.idleExpiresAt,
          absoluteExpiresAt: data.absoluteExpiresAt,
        },
      });

      return createdSession;
    });

    return this.mapSession(session);
  }

  async findRefreshTokenByHash(
    refreshTokenHash: string,
  ): Promise<AuthRefreshTokenRecord | null> {
    const token = await this.prisma.authRefreshToken.findUnique({
      where: { tokenHash: refreshTokenHash },
      include: {
        session: true,
      },
    });

    return token ? this.mapRefreshToken(token) : null;
  }

  async revokeActiveSessionsByAccountId(
    accountId: string,
    revokedAt: Date,
  ): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      const sessions = await tx.authSession.findMany({
        where: {
          accountId,
          status: 'ACTIVE',
          revokedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (sessions.length === 0) {
        return 0;
      }

      const sessionIds = sessions.map((session) => session.id);

      const result = await tx.authSession.updateMany({
        where: {
          id: { in: sessionIds },
        },
        data: {
          status: 'REVOKED',
          revokedAt,
        },
      });

      await tx.authRefreshToken.updateMany({
        where: {
          sessionId: { in: sessionIds },
          revokedAt: null,
        },
        data: {
          status: 'REVOKED',
          revokedAt,
        },
      });

      return result.count;
    });
  }

  async revokeRefreshTokenFamily(
    refreshTokenFamilyId: string,
    revokedAt: Date,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.authSession.updateMany({
        where: {
          refreshTokenFamilyId,
          status: 'ACTIVE',
        },
        data: {
          status: 'REVOKED',
          revokedAt,
        },
      });

      await tx.authRefreshToken.updateMany({
        where: {
          refreshTokenFamilyId,
          revokedAt: null,
        },
        data: {
          status: 'REVOKED',
          revokedAt,
        },
      });
    });
  }

  async revokeSessionById(sessionId: string, revokedAt: Date): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.authSession.updateMany({
        where: {
          id: sessionId,
          status: 'ACTIVE',
        },
        data: {
          status: 'REVOKED',
          revokedAt,
        },
      });

      await tx.authRefreshToken.updateMany({
        where: {
          sessionId,
          revokedAt: null,
        },
        data: {
          status: 'REVOKED',
          revokedAt,
        },
      });
    });
  }

  async rotateRefreshToken(
    data: RotateRefreshTokenData,
  ): Promise<AuthSessionRecord | null> {
    const session = await this.prisma.$transaction(async (tx) => {
      const rotatedToken = await tx.authRefreshToken.updateMany({
        where: {
          sessionId: data.sessionId,
          tokenHash: data.previousRefreshTokenHash,
          status: 'ACTIVE',
          revokedAt: null,
        },
        data: {
          status: 'ROTATED',
          lastUsedAt: data.usedAt,
          rotatedAt: data.usedAt,
        },
      });

      if (rotatedToken.count !== 1) {
        return null;
      }

      await tx.authRefreshToken.create({
        data: {
          sessionId: data.sessionId,
          refreshTokenFamilyId: data.refreshTokenFamilyId,
          tokenHash: data.nextRefreshTokenHash,
          idleExpiresAt: data.nextIdleExpiresAt,
          absoluteExpiresAt: data.absoluteExpiresAt,
        },
      });

      return tx.authSession.update({
        where: {
          id: data.sessionId,
        },
        data: {
          refreshTokenHash: data.nextRefreshTokenHash,
          idleExpiresAt: data.nextIdleExpiresAt,
          lastUsedAt: data.usedAt,
        },
      });
    });

    return session ? this.mapSession(session) : null;
  }

  private mapRefreshToken(
    token: PrismaAuthRefreshTokenRecord,
  ): AuthRefreshTokenRecord {
    return {
      id: token.id,
      sessionId: token.sessionId,
      refreshTokenFamilyId: token.refreshTokenFamilyId,
      tokenHash: token.tokenHash,
      status: token.status.toLowerCase() as AuthRefreshTokenRecord['status'],
      createdAt: token.createdAt,
      lastUsedAt: token.lastUsedAt,
      rotatedAt: token.rotatedAt,
      revokedAt: token.revokedAt,
      idleExpiresAt: token.idleExpiresAt,
      absoluteExpiresAt: token.absoluteExpiresAt,
      session: this.mapSession(token.session),
    };
  }

  private mapSession(session: PrismaAuthSessionRecord): AuthSessionRecord {
    return {
      id: session.id,
      accountId: session.accountId,
      refreshTokenHash: session.refreshTokenHash,
      refreshTokenFamilyId: session.refreshTokenFamilyId,
      creationSource:
        session.creationSource.toLowerCase() as AuthSessionRecord['creationSource'],
      status: session.status.toLowerCase() as AuthSessionRecord['status'],
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      lastUsedAt: session.lastUsedAt,
      idleExpiresAt: session.idleExpiresAt,
      absoluteExpiresAt: session.absoluteExpiresAt,
      revokedAt: session.revokedAt,
    };
  }

  private mapCreationSourceToPrisma(
    creationSource: CreateAuthSessionData['creationSource'],
  ): PrismaAuthSessionRecord['creationSource'] {
    return creationSource.toUpperCase() as PrismaAuthSessionRecord['creationSource'];
  }
}

export { PrismaAuthSessionsRepository };
