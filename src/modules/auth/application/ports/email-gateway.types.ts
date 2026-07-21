type SendMagicLinkEmailRequest = {
  email: string;
  magicLinkUrl: string;
  expiresAt: Date;
};

export type { SendMagicLinkEmailRequest };
