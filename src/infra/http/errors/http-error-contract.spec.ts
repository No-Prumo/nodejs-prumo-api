import { HttpStatus } from '@nestjs/common';
import { errorCodes } from '@shared/errors/error-codes';
import {
  getDefaultErrorCodeForStatus,
  getPublicErrorStatus,
  publicErrorStatusByCode,
} from './http-error-contract';

describe('HTTP error contract', () => {
  it('maps every public error code to one semantic HTTP status', () => {
    expect(Object.keys(publicErrorStatusByCode).sort()).toEqual(
      [...errorCodes].sort(),
    );

    expect(getPublicErrorStatus('validation_error')).toBe(
      HttpStatus.BAD_REQUEST,
    );
    expect(getPublicErrorStatus('invalid_access_token')).toBe(
      HttpStatus.UNAUTHORIZED,
    );
    expect(getPublicErrorStatus('account_auth_forbidden')).toBe(
      HttpStatus.FORBIDDEN,
    );
    expect(getPublicErrorStatus('magic_link_already_used')).toBe(
      HttpStatus.CONFLICT,
    );
    expect(getPublicErrorStatus('magic_link_expired')).toBe(HttpStatus.GONE);
    expect(getPublicErrorStatus('rate_limited')).toBe(
      HttpStatus.TOO_MANY_REQUESTS,
    );
    expect(getPublicErrorStatus('email_delivery_unavailable')).toBe(
      HttpStatus.SERVICE_UNAVAILABLE,
    );
    expect(getPublicErrorStatus('internal_error')).toBe(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it.each([
    [HttpStatus.BAD_REQUEST, 'bad_request'],
    [HttpStatus.UNAUTHORIZED, 'unauthorized'],
    [HttpStatus.FORBIDDEN, 'forbidden'],
    [HttpStatus.NOT_FOUND, 'resource_not_found'],
    [HttpStatus.CONFLICT, 'conflict'],
    [HttpStatus.GONE, 'resource_not_found'],
    [HttpStatus.UNPROCESSABLE_ENTITY, 'business_rule_violation'],
    [HttpStatus.TOO_MANY_REQUESTS, 'rate_limited'],
    [HttpStatus.INTERNAL_SERVER_ERROR, 'internal_error'],
    [HttpStatus.SERVICE_UNAVAILABLE, 'internal_error'],
  ] as const)(
    'maps framework status %s to fallback code %s',
    (statusCode, expectedCode) => {
      expect(getDefaultErrorCodeForStatus(statusCode)).toBe(expectedCode);
    },
  );
});
