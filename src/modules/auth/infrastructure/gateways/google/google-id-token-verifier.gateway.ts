import { Inject, Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { authErrorReasons } from '@auth/application/errors/auth-error-reasons';
import { invalidGoogleCredential } from '@auth/application/errors/auth-errors';
import { authConfig, type AuthConfig } from '@config';
import { unixSecondsToMilliseconds } from '@shared/time/time.helpers';
import type {
  GoogleIdTokenVerifier,
  VerifiedGoogleIdentity,
  VerifyGoogleIdTokenRequest,
} from '../../../application/ports/google-id-token-verifier';
import type {
  GoogleOAuthClient,
  GoogleTokenPayload,
} from './google-id-token-verifier.gateway.types';

const googleIssuers = ['accounts.google.com', 'https://accounts.google.com'];

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
      throw invalidGoogleCredential({
        action: 'verify_google_id_token',
        reason: authErrorReasons.missingClientId,
      });
    }

    let payload: GoogleTokenPayload | undefined;

    try {
      const ticket = await this.oauthClient.verifyIdToken({
        audience: clientId,
        idToken: request.idToken,
      });
      payload = ticket.getPayload();
    } catch (error) {
      throw invalidGoogleCredential({
        action: 'verify_google_id_token',
        cause: error,
        reason: authErrorReasons.verificationFailed,
      });
    }

    if (!payload) {
      throw invalidGoogleCredential({
        action: 'verify_google_id_token',
        reason: authErrorReasons.missingPayload,
      });
    }

    if (!payload.iss || !googleIssuers.includes(payload.iss)) {
      throw invalidGoogleCredential({
        action: 'verify_google_id_token',
        reason: authErrorReasons.invalidIssuer,
      });
    }

    if (payload.aud !== clientId) {
      throw invalidGoogleCredential({
        action: 'verify_google_id_token',
        reason: authErrorReasons.invalidAudience,
      });
    }

    if (!payload.exp || unixSecondsToMilliseconds(payload.exp) <= Date.now()) {
      throw invalidGoogleCredential({
        action: 'verify_google_id_token',
        reason: authErrorReasons.expiredToken,
      });
    }

    const subject = payload.sub?.trim();

    if (!subject) {
      throw invalidGoogleCredential({
        action: 'verify_google_id_token',
        reason: authErrorReasons.missingSubject,
      });
    }

    const email = payload.email?.trim();

    if (!email || !email.includes('@')) {
      throw invalidGoogleCredential({
        action: 'verify_google_id_token',
        reason: authErrorReasons.missingEmail,
      });
    }

    if (!isVerifiedEmail(payload.email_verified)) {
      throw invalidGoogleCredential({
        action: 'verify_google_id_token',
        reason: authErrorReasons.unverifiedEmail,
      });
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

export { GoogleIdTokenVerifierGateway };
