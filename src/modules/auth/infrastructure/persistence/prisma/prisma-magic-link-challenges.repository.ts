import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infra/prisma/prisma.service';
import type {
  CreateMagicLinkChallengeData,
  MagicLinkChallengeRecord,
  MagicLinkChallengesRepository,
} from '../../../application/ports/magic-link-challenges.repository';

type PrismaMagicLinkChallengeRecord = {
  id: string;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
};

@Injectable()
class PrismaMagicLinkChallengesRepository implements MagicLinkChallengesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateMagicLinkChallengeData,
  ): Promise<MagicLinkChallengeRecord> {
    const challenge = await this.prisma.magicLinkChallenge.create({
      data: {
        email: data.email,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });

    return this.mapChallenge(challenge);
  }

  async consumeByTokenHash(
    tokenHash: string,
    consumedAt: Date,
  ): Promise<MagicLinkChallengeRecord | null> {
    const updateResult = await this.prisma.magicLinkChallenge.updateMany({
      where: {
        tokenHash,
        usedAt: null,
        revokedAt: null,
        expiresAt: { gt: consumedAt },
      },
      data: {
        usedAt: consumedAt,
      },
    });

    if (updateResult.count === 0) {
      return null;
    }

    const challenge = await this.prisma.magicLinkChallenge.findUnique({
      where: { tokenHash },
    });

    return challenge ? this.mapChallenge(challenge) : null;
  }

  private mapChallenge(
    challenge: PrismaMagicLinkChallengeRecord,
  ): MagicLinkChallengeRecord {
    return {
      id: challenge.id,
      email: challenge.email,
      tokenHash: challenge.tokenHash,
      expiresAt: challenge.expiresAt,
      usedAt: challenge.usedAt,
      revokedAt: challenge.revokedAt,
      createdAt: challenge.createdAt,
    };
  }
}

export { PrismaMagicLinkChallengesRepository };
