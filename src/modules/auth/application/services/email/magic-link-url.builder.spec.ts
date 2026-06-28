import { buildTestEmailConfig } from '@test-support/email/build-test-email-config';
import {
  MagicLinkUrlBuilder,
  magicLinkFrontendPath,
} from './magic-link-url.builder';

describe('MagicLinkUrlBuilder', () => {
  it('builds the trusted frontend URL and safely encodes the token', () => {
    const builder = new MagicLinkUrlBuilder(
      buildTestEmailConfig({
        WEB_APP_BASE_URL: 'https://app.sandicts.com',
      }),
    );

    const result = new URL(builder.build('token+with/symbols'));

    expect(result.origin).toBe('https://app.sandicts.com');
    expect(result.pathname).toBe(magicLinkFrontendPath);
    expect(result.searchParams.get('token')).toBe('token+with/symbols');
  });
});
