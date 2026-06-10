const EMAIL_GATEWAY = Symbol('EMAIL_GATEWAY');

type SendMagicLinkEmailRequest = {
  email: string;
  token: string;
  expiresAt: Date;
};

type EmailGateway = {
  sendMagicLink(request: SendMagicLinkEmailRequest): Promise<void>;
};

export { EMAIL_GATEWAY };
export type { EmailGateway, SendMagicLinkEmailRequest };
