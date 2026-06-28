import type { EmailGateway } from '@auth/application/ports/email-gateway';
import type { EmailConfig } from '@config';
import { DevelopmentEmailGateway } from './development-email.gateway';
import { ResendEmailGateway } from './resend-email.gateway';
import { SmtpEmailGateway } from './smtp-email.gateway';

function createEmailGateway(settings: EmailConfig): EmailGateway {
  switch (settings.provider) {
    case 'development':
      return new DevelopmentEmailGateway();
    case 'resend':
      return new ResendEmailGateway(settings);
    case 'smtp':
      return new SmtpEmailGateway(settings);
  }
}

export { createEmailGateway };
