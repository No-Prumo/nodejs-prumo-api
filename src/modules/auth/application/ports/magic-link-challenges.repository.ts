const MAGIC_LINK_CHALLENGES_REPOSITORY = Symbol(
  'MAGIC_LINK_CHALLENGES_REPOSITORY',
);

type MagicLinkChallengeRecord = {
  id: string;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
};

type CreateMagicLinkChallengeData = {
  email: string;
  tokenHash: string;
  expiresAt: Date;
};

type MagicLinkChallengesRepository = {
  create(data: CreateMagicLinkChallengeData): Promise<MagicLinkChallengeRecord>;
  consumeByTokenHash(
    tokenHash: string,
    consumedAt: Date,
  ): Promise<MagicLinkChallengeRecord | null>;
};

export { MAGIC_LINK_CHALLENGES_REPOSITORY };
export type {
  CreateMagicLinkChallengeData,
  MagicLinkChallengeRecord,
  MagicLinkChallengesRepository,
};
