import type { RequestMagicLinkUseCaseResponse } from '../../../application/use-cases/request-magic-link/request-magic-link.use-case.types';
import { RequestMagicLinkController } from './request-magic-link.controller';

describe('RequestMagicLinkController', () => {
  it('returns the magic link request use case response', async () => {
    const requestMagicLink = {
      execute: vi
        .fn<() => Promise<RequestMagicLinkUseCaseResponse>>()
        .mockResolvedValue({
          message: 'If the email can sign in, a magic link will be sent.',
        }),
    };
    const controller = new RequestMagicLinkController(
      requestMagicLink as never,
    );

    await expect(
      controller.request({ email: 'user@example.com' }),
    ).resolves.toEqual({
      message: 'If the email can sign in, a magic link will be sent.',
    });
    expect(requestMagicLink.execute).toHaveBeenCalledWith({
      email: 'user@example.com',
    });
  });
});
