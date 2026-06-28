import type {
  ConsumeMagicLinkChallengeResult,
  CreateMagicLinkChallengeData,
  MagicLinkChallengeRecord,
  MagicLinkChallengesRepository,
} from '../../../application/ports/magic-link-challenges.repository';

class InMemoryMagicLinkChallengesRepository implements MagicLinkChallengesRepository {
  readonly magicLinkChallenges: MagicLinkChallengeRecord[] = [];

  replaceActive(
    data: CreateMagicLinkChallengeData,
    replacedAt: Date,
  ): Promise<MagicLinkChallengeRecord> {
    for (const challenge of this.magicLinkChallenges) {
      const isActive =
        challenge.email === data.email &&
        challenge.usedAt === null &&
        challenge.revokedAt === null &&
        challenge.expiresAt > replacedAt;

      if (isActive) {
        challenge.revokedAt = replacedAt;
      }
    }

    const challenge: MagicLinkChallengeRecord = {
      id: crypto.randomUUID(),
      email: data.email,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      usedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    };

    this.magicLinkChallenges.push(challenge);

    return Promise.resolve(challenge);
  }

  consumeByTokenHash(
    tokenHash: string,
    consumedAt: Date,
  ): Promise<ConsumeMagicLinkChallengeResult> {
    const challenge = this.magicLinkChallenges.find(
      (candidate) => candidate.tokenHash === tokenHash,
    );

    if (!challenge) {
      return Promise.resolve({ status: 'invalid' });
    }

    if (challenge.usedAt !== null) {
      return Promise.resolve({ status: 'already_used' });
    }

    if (challenge.revokedAt !== null) {
      return Promise.resolve({ status: 'revoked' });
    }

    if (challenge.expiresAt <= consumedAt) {
      return Promise.resolve({ status: 'expired' });
    }

    challenge.usedAt = consumedAt;

    return Promise.resolve({
      status: 'consumed',
      challenge,
    });
  }
}

export { InMemoryMagicLinkChallengesRepository };
