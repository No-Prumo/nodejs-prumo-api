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

type ConsumeMagicLinkChallengeResult =
  | {
      status: 'consumed';
      challenge: MagicLinkChallengeRecord;
    }
  | {
      status: 'invalid';
    }
  | {
      status: 'expired';
    }
  | {
      status: 'already_used';
    }
  | {
      status: 'revoked';
    };

type MagicLinkChallengesRepository = {
  replaceActive(
    data: CreateMagicLinkChallengeData,
    replacedAt: Date,
  ): Promise<MagicLinkChallengeRecord>;
  consumeByTokenHash(
    tokenHash: string,
    consumedAt: Date,
  ): Promise<ConsumeMagicLinkChallengeResult>;
};

export { MAGIC_LINK_CHALLENGES_REPOSITORY };
export type {
  CreateMagicLinkChallengeData,
  ConsumeMagicLinkChallengeResult,
  MagicLinkChallengeRecord,
  MagicLinkChallengesRepository,
};
