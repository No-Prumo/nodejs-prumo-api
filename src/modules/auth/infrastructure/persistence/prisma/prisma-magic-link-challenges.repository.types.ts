type PrismaMagicLinkChallengeRecord = {
  id: string;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
};

export type { PrismaMagicLinkChallengeRecord };
