const GOOGLE_ID_TOKEN_VERIFIER = Symbol('GOOGLE_ID_TOKEN_VERIFIER');

type VerifyGoogleIdTokenRequest = {
  idToken: string;
};

type VerifiedGoogleIdentity = {
  subject: string;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
};

type GoogleIdTokenVerifier = {
  verify(request: VerifyGoogleIdTokenRequest): Promise<VerifiedGoogleIdentity>;
};

export { GOOGLE_ID_TOKEN_VERIFIER };
export type {
  GoogleIdTokenVerifier,
  VerifiedGoogleIdentity,
  VerifyGoogleIdTokenRequest,
};
