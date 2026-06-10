import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { authConfig, type AuthConfig } from '../../../../../config';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type AccessTokenClaims = {
  sub: string;
  sessionId: string;
  role?: string;
  partnerId?: string;
};

type IssuedAccessToken = {
  token: string;
  expiresAt: Date;
};

@Injectable()
class TokenService {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authSettings: AuthConfig,
  ) {}

  issueAccessToken(claims: AccessTokenClaims): IssuedAccessToken {
    const issuedAtSeconds = Math.floor(Date.now() / 1000);
    const expiresAtSeconds =
      issuedAtSeconds + this.authSettings.accessTokenTtlSeconds;

    const payload = {
      ...claims,
      iat: issuedAtSeconds,
      exp: expiresAtSeconds,
    };

    return {
      token: this.signJwt(payload),
      expiresAt: new Date(expiresAtSeconds * 1000),
    };
  }

  generateOpaqueRefreshToken(): string {
    return randomBytes(48).toString('base64url');
  }

  generateRefreshTokenFamilyId(): string {
    return randomUUID();
  }

  private signJwt(payload: Record<string, JsonValue>): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = this.base64UrlEncodeJson(header);
    const encodedPayload = this.base64UrlEncodeJson(payload);
    const signature = createHmac('sha256', this.authSettings.accessTokenSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private base64UrlEncodeJson(value: Record<string, JsonValue>): string {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }
}

export { TokenService };
export type { AccessTokenClaims, IssuedAccessToken };
