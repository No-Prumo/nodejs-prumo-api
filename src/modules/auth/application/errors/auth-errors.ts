import { AppError } from '../../../../shared/errors/app-error';
import type { AppErrorCode } from '../../../../shared/errors/error-codes';
import type { AuthErrorContext, AuthErrorDetails } from './auth-errors.types';

const INVALID_AUTHENTICATION_MESSAGE = 'Invalid authentication credentials';

function invalidAccessToken(context: AuthErrorContext = {}): AppError {
  return authError('invalid_access_token', INVALID_AUTHENTICATION_MESSAGE, {
    severity: 'auth',
    ...context,
  });
}

function invalidRefreshToken(context: AuthErrorContext = {}): AppError {
  return authError('invalid_refresh_token', INVALID_AUTHENTICATION_MESSAGE, {
    severity: 'auth',
    ...context,
  });
}

function refreshTokenExpired(context: AuthErrorContext = {}): AppError {
  return authError('refresh_token_expired', INVALID_AUTHENTICATION_MESSAGE, {
    severity: 'auth',
    ...context,
  });
}

function refreshTokenReused(context: AuthErrorContext = {}): AppError {
  return authError('refresh_token_reused', INVALID_AUTHENTICATION_MESSAGE, {
    severity: 'security',
    ...context,
  });
}

function refreshTokenRevoked(context: AuthErrorContext = {}): AppError {
  return authError('refresh_token_revoked', INVALID_AUTHENTICATION_MESSAGE, {
    severity: 'auth',
    ...context,
  });
}

function authSessionInactive(context: AuthErrorContext = {}): AppError {
  return authError('auth_session_inactive', INVALID_AUTHENTICATION_MESSAGE, {
    severity: 'auth',
    ...context,
  });
}

function accountAuthForbidden(context: AuthErrorContext = {}): AppError {
  return authError(
    'account_auth_forbidden',
    'Account cannot perform auth action',
    {
      severity: 'auth',
      ...context,
    },
  );
}

function authError(
  code: AppErrorCode,
  message: string,
  context: AuthErrorContext,
): AppError {
  return new AppError(code, message, {
    details: buildAuthErrorDetails(code, context),
  });
}

function buildAuthErrorDetails(
  code: AppErrorCode,
  context: AuthErrorContext,
): AuthErrorDetails {
  return {
    area: 'auth',
    severity: context.severity ?? 'auth',
    code,
    accountId: context.accountId,
    action: context.action,
    refreshTokenFamilyId: context.refreshTokenFamilyId,
    reason: context.reason,
    sessionId: context.sessionId,
    status: context.status,
  };
}

export {
  accountAuthForbidden,
  authSessionInactive,
  invalidAccessToken,
  invalidRefreshToken,
  refreshTokenExpired,
  refreshTokenReused,
  refreshTokenRevoked,
};
