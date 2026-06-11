import { Inject, Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { authConfig, type AuthConfig } from '../../../../../config';
import { AppError } from '../../../../../shared/errors/app-error';
import type {
  GoogleIdTokenVerifier,
  VerifiedGoogleIdentity,
  VerifyGoogleIdTokenRequest,
} from '../../../application/ports/google-id-token-verifier';

const googleIssuers = ['accounts.google.com', 'https://accounts.google.com'];

type GoogleTokenPayload = {
  aud?: string;
  email?: string;
  email_verified?: boolean | string;
  exp?: number;
  iss?: string;
  name?: string;
  sub?: string;
};

type GoogleLoginTicket = {
  getPayload(): GoogleTokenPayload | undefined;
};

type GoogleOAuthClient = {
  verifyIdToken(options: {
    audience: string;
    idToken: string;
  }): Promise<GoogleLoginTicket>;
};

@Injectable()
class GoogleIdTokenVerifierGateway implements GoogleIdTokenVerifier {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authSettings: AuthConfig,
    private readonly oauthClient: GoogleOAuthClient = new OAuth2Client(),
  ) {}

  async verify(
    request: VerifyGoogleIdTokenRequest,
  ): Promise<VerifiedGoogleIdentity> {
    const clientId = this.authSettings.google.clientId;

    if (!clientId) {
      throw invalidGoogleCredential(undefined, 'missing_client_id');
    }

    let payload: GoogleTokenPayload | undefined;

    try {
      const ticket = await this.oauthClient.verifyIdToken({
        audience: clientId,
        idToken: request.idToken,
      });
      payload = ticket.getPayload();
    } catch (error) {
      throw invalidGoogleCredential(error, 'verification_failed');
    }

    if (!payload) {
      throw invalidGoogleCredential(undefined, 'missing_payload');
    }

    if (!payload.iss || !googleIssuers.includes(payload.iss)) {
      throw invalidGoogleCredential(undefined, 'invalid_issuer');
    }

    if (payload.aud !== clientId) {
      throw invalidGoogleCredential(undefined, 'invalid_audience');
    }

    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      throw invalidGoogleCredential(undefined, 'expired_token');
    }

    const subject = payload.sub?.trim();

    if (!subject) {
      throw invalidGoogleCredential(undefined, 'missing_subject');
    }

    const email = payload.email?.trim();

    if (!email || !email.includes('@')) {
      throw invalidGoogleCredential(undefined, 'missing_email');
    }

    if (!isVerifiedEmail(payload.email_verified)) {
      throw invalidGoogleCredential(undefined, 'unverified_email');
    }

    return {
      subject,
      email,
      emailVerified: true,
      displayName: normalizeNullableText(payload.name),
    };
  }
}

function isVerifiedEmail(value: unknown) {
  return value === true || value === 'true';
}

function normalizeNullableText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function invalidGoogleCredential(cause?: unknown, reason?: string): AppError {
  return new AppError('unauthorized', 'Invalid authentication credentials', {
    cause,
    details: reason ? { reason } : undefined,
  });
}

export { GoogleIdTokenVerifierGateway };
export type { GoogleOAuthClient };
