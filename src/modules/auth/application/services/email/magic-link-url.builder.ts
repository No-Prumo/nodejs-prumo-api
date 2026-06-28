import { Inject, Injectable } from '@nestjs/common';
import { emailConfig, type EmailConfig } from '@config';

const magicLinkFrontendPath = '/sign-in/magic-link';

@Injectable()
class MagicLinkUrlBuilder {
  constructor(
    @Inject(emailConfig.KEY)
    private readonly emailSettings: EmailConfig,
  ) {}

  build(token: string): string {
    const url = new URL(
      magicLinkFrontendPath,
      this.emailSettings.webAppBaseUrl,
    );
    url.searchParams.set('token', token);

    return url.toString();
  }
}

export { MagicLinkUrlBuilder, magicLinkFrontendPath };
