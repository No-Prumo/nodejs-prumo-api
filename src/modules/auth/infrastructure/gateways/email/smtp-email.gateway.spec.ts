import type { SmtpEmailConfig } from '@config';
import { SmtpEmailGateway } from './smtp-email.gateway';
import type { SmtpEmailTransport } from './smtp-email.gateway.types';

const settings: SmtpEmailConfig = {
  provider: 'smtp',
  fromAddress: 'auth@sandicts.test',
  fromName: 'Sandicts',
  replyToAddress: null,
  webAppBaseUrl: 'http://localhost:3001',
  host: 'localhost',
  port: 1025,
  secure: false,
  user: null,
  password: null,
};

describe('SmtpEmailGateway', () => {
  function makeSut() {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'message-id' });
    const transport = {
      sendMail,
    } as unknown as SmtpEmailTransport;

    return {
      gateway: new SmtpEmailGateway(settings, transport),
      sendMail,
    };
  }

  it('sends the magic link through the configured SMTP transport', async () => {
    const { gateway, sendMail } = makeSut();

    await gateway.sendMagicLink({
      email: 'player@example.com',
      magicLinkUrl:
        'http://localhost:3001/sign-in/magic-link?token=secret-token',
      expiresAt: new Date('2026-07-01T12:00:00.000Z'),
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: {
          address: 'auth@sandicts.test',
          name: 'Sandicts',
        },
        to: 'player@example.com',
        subject: 'Sign in to Sandicts',
      }),
    );
  });

  it('maps transport failures to a safe public error', async () => {
    const { gateway, sendMail } = makeSut();
    sendMail.mockRejectedValue(new Error('SMTP connection detail'));

    await expect(
      gateway.sendMagicLink({
        email: 'player@example.com',
        magicLinkUrl:
          'http://localhost:3001/sign-in/magic-link?token=secret-token',
        expiresAt: new Date('2026-07-01T12:00:00.000Z'),
      }),
    ).rejects.toMatchObject({
      code: 'email_delivery_unavailable',
      message: 'Email delivery is temporarily unavailable',
    });
  });
});
