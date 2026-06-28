const appErrorCodes = [
  'unauthorized',
  'invalid_google_credential',
  'invalid_magic_link_token',
  'magic_link_expired',
  'magic_link_already_used',
  'magic_link_superseded',
  'email_delivery_unavailable',
  'invalid_access_token',
  'invalid_refresh_token',
  'refresh_token_expired',
  'refresh_token_reused',
  'refresh_token_revoked',
  'auth_session_inactive',
  'forbidden',
  'account_auth_forbidden',
  'external_identity_conflict',
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
