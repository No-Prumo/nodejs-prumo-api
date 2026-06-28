import { Resend } from 'resend';
import type { CreateEmailOptions } from 'resend';
import { authErrorReasons } from '@auth/application/errors/auth-error-reasons';
import { emailDeliveryUnavailable } from '@auth/application/errors/auth-errors';
import type {
  EmailGateway,
  SendMagicLinkEmailRequest,
} from '@auth/application/ports/email-gateway';
import type { ResendEmailConfig } from '@config';
import { buildMagicLinkEmailContent } from './magic-link-email-content';
import type { ResendEmailClient } from './resend-email.gateway.types';

class ResendEmailGateway implements EmailGateway {
  private readonly client: ResendEmailClient;

  constructor(
    private readonly settings: ResendEmailConfig,
    client?: ResendEmailClient,
  ) {
    this.client = client ?? new Resend(settings.apiKey);
  }

  async sendMagicLink(request: SendMagicLinkEmailRequest): Promise<void> {
    const content = buildMagicLinkEmailContent(
      request.magicLinkUrl,
      request.expiresAt,
    );
    const payload: CreateEmailOptions = {
      from: `${this.settings.fromName} <${this.settings.fromAddress}>`,
      to: request.email,
      subject: content.subject,
      text: content.text,
      html: content.html,
    };

    if (this.settings.replyToAddress !== null) {
      payload.replyTo = this.settings.replyToAddress;
    }

    let result;

    try {
      result = await this.client.emails.send(payload);
    } catch {
      throw this.deliveryUnavailable();
    }

    if (result.error !== null) {
      throw this.deliveryUnavailable();
    }
  }

  private deliveryUnavailable() {
    return emailDeliveryUnavailable({
      action: 'send_magic_link_email',
      reason: authErrorReasons.emailDeliveryFailed,
    });
  }
}

export { ResendEmailGateway };
