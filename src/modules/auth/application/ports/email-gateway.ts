import type { SendMagicLinkEmailRequest } from './email-gateway.types';

const EMAIL_GATEWAY = Symbol('EMAIL_GATEWAY');

type EmailGateway = {
  sendMagicLink(request: SendMagicLinkEmailRequest): Promise<void>;
};

export { EMAIL_GATEWAY };
export type { EmailGateway };
