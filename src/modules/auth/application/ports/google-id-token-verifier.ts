import type {
  VerifiedGoogleIdentity,
  VerifyGoogleIdTokenRequest,
} from './google-id-token-verifier.types';

const GOOGLE_ID_TOKEN_VERIFIER = Symbol('GOOGLE_ID_TOKEN_VERIFIER');

type GoogleIdTokenVerifier = {
  verify(request: VerifyGoogleIdTokenRequest): Promise<VerifiedGoogleIdentity>;
};

export { GOOGLE_ID_TOKEN_VERIFIER };
export type { GoogleIdTokenVerifier };
