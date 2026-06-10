import { Injectable } from '@nestjs/common';
import type {
  EmailGateway,
  SendMagicLinkEmailRequest,
} from '../../../application/ports/email-gateway';

@Injectable()
class DevelopmentEmailGateway implements EmailGateway {
  readonly sentMagicLinks: SendMagicLinkEmailRequest[] = [];

  sendMagicLink(request: SendMagicLinkEmailRequest): Promise<void> {
    this.sentMagicLinks.push(request);

    return Promise.resolve();
  }
}

export { DevelopmentEmailGateway };
