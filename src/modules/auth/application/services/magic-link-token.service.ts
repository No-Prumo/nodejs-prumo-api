import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
class MagicLinkTokenService {
  generateToken(): string {
    return randomBytes(32).toString('base64url');
  }

  hash(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  verify(rawToken: string, expectedHash: string): boolean {
    const actualHash = this.hash(rawToken);
    const actual = Buffer.from(actualHash, 'hex');
    const expected = Buffer.from(expectedHash, 'hex');

    if (actual.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(actual, expected);
  }
}

export { MagicLinkTokenService };
