import { createTransport } from 'nodemailer';
import { authErrorReasons } from '@auth/application/errors/auth-error-reasons';
import { emailDeliveryUnavailable } from '@auth/application/errors/auth-errors';
import type { EmailGateway } from '@auth/application/ports/email-gateway';
import type { SendMagicLinkEmailRequest } from '@auth/application/ports/email-gateway.types';
import type { SmtpEmailConfig } from '@config';
import { buildMagicLinkEmailContent } from './magic-link-email-content';
import type { SmtpEmailTransport } from './smtp-email.gateway.types';

class SmtpEmailGateway implements EmailGateway {
  private readonly transport: SmtpEmailTransport;

  constructor(
    private readonly settings: SmtpEmailConfig,
    transport?: SmtpEmailTransport,
  ) {
    this.transport =
      transport ??
      createTransport({
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        auth:
          settings.user !== null && settings.password !== null
            ? {
                user: settings.user,
                pass: settings.password,
              }
            : undefined,
        logger: false,
        debug: false,
        disableFileAccess: true,
        disableUrlAccess: true,
      });
  }

  async sendMagicLink(request: SendMagicLinkEmailRequest): Promise<void> {
    const content = buildMagicLinkEmailContent(
      request.magicLinkUrl,
      request.expiresAt,
    );

    try {
      await this.transport.sendMail({
        from: {
          address: this.settings.fromAddress,
          name: this.settings.fromName,
        },
        to: request.email,
        replyTo: this.settings.replyToAddress ?? undefined,
        subject: content.subject,
        text: content.text,
        html: content.html,
      });
    } catch {
      throw emailDeliveryUnavailable({
        action: 'send_magic_link_email',
        reason: authErrorReasons.emailDeliveryFailed,
      });
    }
  }
}

export { SmtpEmailGateway };
