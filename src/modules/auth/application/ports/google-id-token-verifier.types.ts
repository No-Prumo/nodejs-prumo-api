type VerifyGoogleIdTokenRequest = {
  idToken: string;
};

type VerifiedGoogleIdentity = {
  subject: string;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
};

export type { VerifiedGoogleIdentity, VerifyGoogleIdTokenRequest };
