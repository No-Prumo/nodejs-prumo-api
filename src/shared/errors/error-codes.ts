export const appErrorCodes = [
  'unauthorized',
  'forbidden',
  'resource_not_found',
  'conflict',
  'business_rule_violation',
] as const;

export type AppErrorCode = (typeof appErrorCodes)[number];

export const errorCodes = [
  'bad_request',
  'validation_error',
  ...appErrorCodes,
  'internal_error',
] as const;

export type ErrorCode = (typeof errorCodes)[number];

const errorCodeSet = new Set<string>(errorCodes);

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && errorCodeSet.has(value);
}
