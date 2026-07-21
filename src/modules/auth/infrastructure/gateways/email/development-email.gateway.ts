import { Injectable } from '@nestjs/common';
import type { EmailGateway } from '../../../application/ports/email-gateway';
import type { SendMagicLinkEmailRequest } from '../../../application/ports/email-gateway.types';

@Injectable()
class DevelopmentEmailGateway implements EmailGateway {
  readonly sentMagicLinks: SendMagicLinkEmailRequest[] = [];

  sendMagicLink(request: SendMagicLinkEmailRequest): Promise<void> {
    this.sentMagicLinks.push(request);

    return Promise.resolve();
  }
}

export { DevelopmentEmailGateway };
