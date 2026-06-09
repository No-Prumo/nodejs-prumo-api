import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infra/prisma/prisma.service';
import type {
  AuthSessionRecord,
  AuthSessionsRepository,
  CreateAuthSessionData,
} from '../../../application/ports/auth-sessions.repository';

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

@Injectable()
class PrismaAuthSessionsRepository implements AuthSessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuthSessionData): Promise<AuthSessionRecord> {
    const session = await this.prisma.authSession.create({
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

    return this.mapSession(session);
  }

  async findActiveByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<AuthSessionRecord | null> {
    const now = new Date();
    const session = await this.prisma.authSession.findFirst({
      where: {
        refreshTokenHash,
        status: 'ACTIVE',
        revokedAt: null,
        idleExpiresAt: { gt: now },
        absoluteExpiresAt: { gt: now },
      },
    });

    return session ? this.mapSession(session) : null;
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
