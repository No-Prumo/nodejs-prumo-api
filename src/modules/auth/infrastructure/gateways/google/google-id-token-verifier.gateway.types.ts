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

export type { GoogleLoginTicket, GoogleOAuthClient, GoogleTokenPayload };
