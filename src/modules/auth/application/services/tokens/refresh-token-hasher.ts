import { createHash, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
class RefreshTokenHasher {
  hash(rawRefreshToken: string): string {
    return createHash('sha256').update(rawRefreshToken).digest('hex');
  }

  verify(rawRefreshToken: string, expectedHash: string): boolean {
    const actualHash = this.hash(rawRefreshToken);
    const actual = Buffer.from(actualHash, 'hex');
    const expected = Buffer.from(expectedHash, 'hex');

    if (actual.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(actual, expected);
  }
}

export { RefreshTokenHasher };
