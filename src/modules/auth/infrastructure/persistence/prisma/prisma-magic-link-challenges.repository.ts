import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import type {
  ConsumeMagicLinkChallengeResult,
  CreateMagicLinkChallengeData,
  MagicLinkChallengeRecord,
  MagicLinkChallengesRepository,
} from '../../../application/ports/magic-link-challenges.repository';
import type { PrismaMagicLinkChallengeRecord } from './prisma-magic-link-challenges.repository.types';

const maximumReplaceActiveAttempts = 3;

@Injectable()
class PrismaMagicLinkChallengesRepository implements MagicLinkChallengesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async replaceActive(
    data: CreateMagicLinkChallengeData,
    replacedAt: Date,
  ): Promise<MagicLinkChallengeRecord> {
    for (
      let attempt = 1;
      attempt <= maximumReplaceActiveAttempts;
      attempt += 1
    ) {
      try {
        const challenge = await this.prisma.$transaction(
          async (transaction) => {
            await transaction.magicLinkChallenge.updateMany({
              where: {
                email: data.email,
                usedAt: null,
                revokedAt: null,
                expiresAt: { gt: replacedAt },
              },
              data: {
                revokedAt: replacedAt,
              },
            });

            return transaction.magicLinkChallenge.create({
              data: {
                email: data.email,
                tokenHash: data.tokenHash,
                expiresAt: data.expiresAt,
              },
            });
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );

        return this.mapChallenge(challenge);
      } catch (error) {
        const shouldRetry =
          isTransactionConflictError(error) &&
          attempt < maximumReplaceActiveAttempts;

        if (!shouldRetry) {
          throw error;
        }
      }
    }

    throw new Error('Magic link challenge replacement attempts exhausted');
  }

  async consumeByTokenHash(
    tokenHash: string,
    consumedAt: Date,
  ): Promise<ConsumeMagicLinkChallengeResult> {
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
      const challenge = await this.prisma.magicLinkChallenge.findUnique({
        where: { tokenHash },
      });

      if (!challenge) {
        return { status: 'invalid' };
      }

      if (challenge.usedAt !== null) {
        return { status: 'already_used' };
      }

      if (challenge.revokedAt !== null) {
        return { status: 'revoked' };
      }

      if (challenge.expiresAt <= consumedAt) {
        return { status: 'expired' };
      }

      return { status: 'invalid' };
    }

    const challenge = await this.prisma.magicLinkChallenge.findUniqueOrThrow({
      where: { tokenHash },
    });

    return {
      status: 'consumed',
      challenge: this.mapChallenge(challenge),
    };
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

function isTransactionConflictError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2034'
  );
}

export { PrismaMagicLinkChallengesRepository };
