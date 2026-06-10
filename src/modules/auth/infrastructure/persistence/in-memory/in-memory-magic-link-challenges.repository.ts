import type {
  CreateMagicLinkChallengeData,
  MagicLinkChallengeRecord,
  MagicLinkChallengesRepository,
} from '../../../application/ports/magic-link-challenges.repository';

class InMemoryMagicLinkChallengesRepository implements MagicLinkChallengesRepository {
  readonly magicLinkChallenges: MagicLinkChallengeRecord[] = [];

  create(
    data: CreateMagicLinkChallengeData,
  ): Promise<MagicLinkChallengeRecord> {
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
  ): Promise<MagicLinkChallengeRecord | null> {
    const challenge = this.magicLinkChallenges.find(
      (candidate) =>
        candidate.tokenHash === tokenHash &&
        candidate.usedAt === null &&
        candidate.revokedAt === null &&
        candidate.expiresAt > consumedAt,
    );

    if (!challenge) {
      return Promise.resolve(null);
    }

    challenge.usedAt = consumedAt;

    return Promise.resolve(challenge);
  }
}

export { InMemoryMagicLinkChallengesRepository };
