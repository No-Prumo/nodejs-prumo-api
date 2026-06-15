const appErrorCodes = [
  'unauthorized',
  'invalid_access_token',
  'invalid_refresh_token',
  'refresh_token_expired',
  'refresh_token_reused',
  'refresh_token_revoked',
  'auth_session_inactive',
  'forbidden',
  'account_auth_forbidden',
  'resource_not_found',
  'conflict',
  'business_rule_violation',
] as const;

type AppErrorCode = (typeof appErrorCodes)[number];

const errorCodes = [
  'bad_request',
  'validation_error',
  'rate_limited',
  ...appErrorCodes,
  'internal_error',
] as const;

type ErrorCode = (typeof errorCodes)[number];

const errorCodeSet = new Set<string>(errorCodes);

function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && errorCodeSet.has(value);
}

export { appErrorCodes, errorCodes, isErrorCode };
export type { AppErrorCode, ErrorCode };
