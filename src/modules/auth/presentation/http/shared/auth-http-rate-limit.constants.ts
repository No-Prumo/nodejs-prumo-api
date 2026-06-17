import { minutesToMilliseconds } from '@shared/time/time.helpers';

const authRateLimitWindowMinutes = 15;
const authRateLimitWindowMilliseconds = minutesToMilliseconds(
  authRateLimitWindowMinutes,
);

const requestMagicLinkRateLimit = 5;
const consumeMagicLinkRateLimit = 10;
const googleSignInRateLimit = 20;
const refreshAuthSessionRateLimit = 30;

export {
  authRateLimitWindowMilliseconds,
  consumeMagicLinkRateLimit,
  googleSignInRateLimit,
  refreshAuthSessionRateLimit,
  requestMagicLinkRateLimit,
};
