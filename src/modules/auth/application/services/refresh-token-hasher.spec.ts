import { RefreshTokenHasher } from './refresh-token-hasher';

describe('RefreshTokenHasher', () => {
  it('hashes refresh tokens without preserving the raw value', () => {
    const hasher = new RefreshTokenHasher();
    const rawRefreshToken = 'raw-refresh-token';

    const hash = hasher.hash(rawRefreshToken);

    expect(hash).not.toBe(rawRefreshToken);
    expect(hash).toHaveLength(64);
    expect(hasher.verify(rawRefreshToken, hash)).toBe(true);
    expect(hasher.verify('other-token', hash)).toBe(false);
  });
});
