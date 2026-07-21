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

export type {
  ConsumeMagicLinkChallengeResult,
  CreateMagicLinkChallengeData,
  MagicLinkChallengeRecord,
};
