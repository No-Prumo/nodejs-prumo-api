import { AppError } from '@shared/errors/app-error';
import type { AppErrorCode } from '@shared/errors/error-codes';
import type {
  AuthErrorContext,
  AuthErrorDetails,
  AuthErrorOptions,
} from './auth-errors.types';

const INVALID_AUTHENTICATION_MESSAGE = 'Invalid authentication credentials';

function invalidAccessToken(context: AuthErrorContext = {}): AppError {
  return authError('invalid_access_token', INVALID_AUTHENTICATION_MESSAGE, {
    severity: 'auth',
    ...context,
  });
}

function invalidGoogleCredential(options: AuthErrorOptions = {}): AppError {
  return authError(
    'invalid_google_credential',
    INVALID_AUTHENTICATION_MESSAGE,
    {
      severity: 'auth',
      ...options,
    },
  );
}

function invalidMagicLinkToken(context: AuthErrorContext = {}): AppError {
  return authError(
    'invalid_magic_link_token',
    'Magic link is invalid or expired',
    {
      severity: 'auth',
      ...context,
    },
  );
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

function accountNotFound(context: AuthErrorContext = {}): AppError {
  return authError('resource_not_found', 'Account was not found', {
    severity: 'auth',
    ...context,
  });
}

function externalIdentityConflict(options: AuthErrorOptions = {}): AppError {
  return authError(
    'external_identity_conflict',
    'Account is already linked to an external identity',
    {
      severity: 'auth',
      ...options,
    },
  );
}

function authError(
  code: AppErrorCode,
  message: string,
  options: AuthErrorOptions,
): AppError {
  return new AppError(code, message, {
    cause: options.cause,
    details: buildAuthErrorDetails(code, options),
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
    provider: context.provider,
    refreshTokenFamilyId: context.refreshTokenFamilyId,
    reason: context.reason,
    sessionId: context.sessionId,
    status: context.status,
  };
}

export {
  accountAuthForbidden,
  accountNotFound,
  authSessionInactive,
  externalIdentityConflict,
  invalidAccessToken,
  invalidGoogleCredential,
  invalidMagicLinkToken,
  invalidRefreshToken,
  refreshTokenExpired,
  refreshTokenReused,
  refreshTokenRevoked,
};
