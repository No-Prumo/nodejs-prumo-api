import type {
  DevelopmentEmailConfig,
  ResendEmailConfig,
  SmtpEmailConfig,
} from '@config';
import { DevelopmentEmailGateway } from './development-email.gateway';
import { createEmailGateway } from './email-gateway.factory';
import { ResendEmailGateway } from './resend-email.gateway';
import { SmtpEmailGateway } from './smtp-email.gateway';

const base = {
  fromAddress: 'auth@sandicts.test',
  fromName: 'Sandicts',
  replyToAddress: null,
  webAppBaseUrl: 'http://localhost:3001',
};

describe('createEmailGateway', () => {
  it('selects the configured adapter', () => {
    const development: DevelopmentEmailConfig = {
      ...base,
      provider: 'development',
    };
    const resend: ResendEmailConfig = {
      ...base,
      provider: 'resend',
      apiKey: 'resend-api-key',
    };
    const smtp: SmtpEmailConfig = {
      ...base,
      provider: 'smtp',
      host: 'localhost',
      port: 1025,
      secure: false,
      user: null,
      password: null,
    };

    expect(createEmailGateway(development)).toBeInstanceOf(
      DevelopmentEmailGateway,
    );
    expect(createEmailGateway(resend)).toBeInstanceOf(ResendEmailGateway);
    expect(createEmailGateway(smtp)).toBeInstanceOf(SmtpEmailGateway);
  });
});
