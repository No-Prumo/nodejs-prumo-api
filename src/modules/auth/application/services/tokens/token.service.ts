import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { authConfig, type AuthConfig } from '../../../../../config';
import type {
  AccessTokenClaims,
  IssuedAccessToken,
  JsonValue,
  VerifiedAccessTokenClaims,
} from './token.service.types';

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

  verifyAccessToken(token: string): VerifiedAccessTokenClaims | null {
    const [encodedHeader, encodedPayload, signature, extraPart] =
      token.split('.');

    if (!encodedHeader || !encodedPayload || !signature || extraPart) {
      return null;
    }

    const expectedSignature = this.signJwtParts(encodedHeader, encodedPayload);

    if (!this.safeEqual(signature, expectedSignature)) {
      return null;
    }

    const header = this.decodeJson(encodedHeader);
    const payload = this.decodeJson(encodedPayload);

    if (
      !header ||
      header.alg !== 'HS256' ||
      header.typ !== 'JWT' ||
      !isVerifiedAccessTokenClaims(payload)
    ) {
      return null;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);

    if (payload.exp <= nowSeconds) {
      return null;
    }

    return payload;
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
    const signature = this.signJwtParts(encodedHeader, encodedPayload);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private signJwtParts(encodedHeader: string, encodedPayload: string): string {
    return createHmac('sha256', this.authSettings.accessTokenSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
  }

  private safeEqual(value: string, expectedValue: string): boolean {
    const actual = Buffer.from(value);
    const expected = Buffer.from(expectedValue);

    if (actual.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(actual, expected);
  }

  private decodeJson(value: string): Record<string, JsonValue> | null {
    try {
      const decoded: unknown = JSON.parse(
        Buffer.from(value, 'base64url').toString(),
      );

      return isJsonRecord(decoded) ? decoded : null;
    } catch {
      return null;
    }
  }

  private base64UrlEncodeJson(value: Record<string, JsonValue>): string {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }
}

function isJsonRecord(value: unknown): value is Record<string, JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isVerifiedAccessTokenClaims(
  value: unknown,
): value is VerifiedAccessTokenClaims {
  if (!isJsonRecord(value)) {
    return false;
  }

  return (
    typeof value.sub === 'string' &&
    typeof value.sessionId === 'string' &&
    typeof value.iat === 'number' &&
    typeof value.exp === 'number' &&
    (value.role === undefined || typeof value.role === 'string') &&
    (value.partnerId === undefined || typeof value.partnerId === 'string')
  );
}

export { TokenService };
