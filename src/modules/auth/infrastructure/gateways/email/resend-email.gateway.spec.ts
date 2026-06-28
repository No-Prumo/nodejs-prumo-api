import type { CreateEmailOptions, CreateEmailResponse } from 'resend';
import type { ResendEmailConfig } from '@config';
import { ResendEmailGateway } from './resend-email.gateway';
import type { ResendEmailClient } from './resend-email.gateway.types';

const settings: ResendEmailConfig = {
  provider: 'resend',
  apiKey: 'resend-api-key',
  fromAddress: 'auth@sandicts.com',
  fromName: 'Sandicts',
  replyToAddress: 'support@sandicts.com',
  webAppBaseUrl: 'https://app.sandicts.com',
};

describe('ResendEmailGateway', () => {
  function makeSut(response: CreateEmailResponse) {
    const send = vi
      .fn<(payload: CreateEmailOptions) => Promise<CreateEmailResponse>>()
      .mockResolvedValue(response);
    const client: ResendEmailClient = {
      emails: { send },
    };

    return {
      gateway: new ResendEmailGateway(settings, client),
      send,
    };
  }

  it('maps the application email request to Resend', async () => {
    const { gateway, send } = makeSut({
      data: { id: 'email-id' },
      error: null,
      headers: null,
    });

    await gateway.sendMagicLink({
      email: 'player@example.com',
      magicLinkUrl:
        'https://app.sandicts.com/sign-in/magic-link?token=secret-token',
      expiresAt: new Date('2026-07-01T12:00:00.000Z'),
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Sandicts <auth@sandicts.com>',
        to: 'player@example.com',
        replyTo: 'support@sandicts.com',
        subject: 'Sign in to Sandicts',
      }),
    );
  });

  it('maps provider rejection to a safe public error', async () => {
    const { gateway } = makeSut({
      data: null,
      error: {
        message: 'provider detail',
        name: 'internal_server_error',
        statusCode: 500,
      },
      headers: null,
    });

    await expect(
      gateway.sendMagicLink({
        email: 'player@example.com',
        magicLinkUrl:
          'https://app.sandicts.com/sign-in/magic-link?token=secret-token',
        expiresAt: new Date('2026-07-01T12:00:00.000Z'),
      }),
    ).rejects.toMatchObject({
      code: 'email_delivery_unavailable',
      message: 'Email delivery is temporarily unavailable',
    });
  });
});
