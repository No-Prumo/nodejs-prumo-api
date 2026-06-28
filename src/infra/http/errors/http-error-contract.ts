import { HttpStatus } from '@nestjs/common';
import type { ErrorCode } from '@shared/errors/error-codes';

const badRequestStatusCode: number = HttpStatus.BAD_REQUEST;
const unauthorizedStatusCode: number = HttpStatus.UNAUTHORIZED;
const forbiddenStatusCode: number = HttpStatus.FORBIDDEN;
const notFoundStatusCode: number = HttpStatus.NOT_FOUND;
const conflictStatusCode: number = HttpStatus.CONFLICT;
const goneStatusCode: number = HttpStatus.GONE;
const unprocessableEntityStatusCode: number = HttpStatus.UNPROCESSABLE_ENTITY;
const tooManyRequestsStatusCode: number = HttpStatus.TOO_MANY_REQUESTS;
const internalServerErrorStatusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;

const publicErrorStatusByCode = {
  bad_request: HttpStatus.BAD_REQUEST,
  validation_error: HttpStatus.BAD_REQUEST,
  unauthorized: HttpStatus.UNAUTHORIZED,
  invalid_google_credential: HttpStatus.UNAUTHORIZED,
  invalid_magic_link_token: HttpStatus.UNAUTHORIZED,
  invalid_access_token: HttpStatus.UNAUTHORIZED,
  invalid_refresh_token: HttpStatus.UNAUTHORIZED,
  refresh_token_expired: HttpStatus.UNAUTHORIZED,
  refresh_token_reused: HttpStatus.UNAUTHORIZED,
  refresh_token_revoked: HttpStatus.UNAUTHORIZED,
  auth_session_inactive: HttpStatus.UNAUTHORIZED,
  forbidden: HttpStatus.FORBIDDEN,
  account_auth_forbidden: HttpStatus.FORBIDDEN,
  resource_not_found: HttpStatus.NOT_FOUND,
  conflict: HttpStatus.CONFLICT,
  external_identity_conflict: HttpStatus.CONFLICT,
  magic_link_already_used: HttpStatus.CONFLICT,
  magic_link_superseded: HttpStatus.CONFLICT,
  magic_link_expired: HttpStatus.GONE,
  business_rule_violation: HttpStatus.UNPROCESSABLE_ENTITY,
  rate_limited: HttpStatus.TOO_MANY_REQUESTS,
  internal_error: HttpStatus.INTERNAL_SERVER_ERROR,
  email_delivery_unavailable: HttpStatus.SERVICE_UNAVAILABLE,
} as const satisfies Record<ErrorCode, number>;

type PublicErrorStatus =
  (typeof publicErrorStatusByCode)[keyof typeof publicErrorStatusByCode];

type ErrorCodeForStatus<Status extends PublicErrorStatus> = {
  [Code in ErrorCode]: (typeof publicErrorStatusByCode)[Code] extends Status
    ? Code
    : never;
}[ErrorCode];

function getPublicErrorStatus(code: ErrorCode) {
  return publicErrorStatusByCode[code];
}

function getDefaultErrorCodeForStatus(statusCode: number): ErrorCode {
  switch (statusCode) {
    case badRequestStatusCode:
      return 'bad_request';
    case unauthorizedStatusCode:
      return 'unauthorized';
    case forbiddenStatusCode:
      return 'forbidden';
    case notFoundStatusCode:
    case goneStatusCode:
      return 'resource_not_found';
    case conflictStatusCode:
      return 'conflict';
    case unprocessableEntityStatusCode:
      return 'business_rule_violation';
    case tooManyRequestsStatusCode:
      return 'rate_limited';
    default:
      return statusCode >= internalServerErrorStatusCode
        ? 'internal_error'
        : 'bad_request';
  }
}

export {
  getDefaultErrorCodeForStatus,
  getPublicErrorStatus,
  publicErrorStatusByCode,
};
export type { ErrorCodeForStatus, PublicErrorStatus };
