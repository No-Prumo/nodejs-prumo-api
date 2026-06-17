import type { AuthProvider } from '../../domain/auth-provider';
import type { AuthErrorReason } from './auth-error-reasons.types';
import type { AppErrorCode } from '@shared/errors/error-codes';

type AuthErrorDetailSeverity = 'auth' | 'security';

type AuthErrorContext = {
  accountId?: string;
  action?: string;
  provider?: AuthProvider;
  refreshTokenFamilyId?: string;
  reason?: AuthErrorReason;
  sessionId?: string;
  severity?: AuthErrorDetailSeverity;
  status?: string;
};

type AuthErrorOptions = AuthErrorContext & {
  cause?: unknown;
};

type AuthErrorDetails = AuthErrorContext & {
  area: 'auth';
  code: AppErrorCode;
  severity: AuthErrorDetailSeverity;
};

export type {
  AuthErrorContext,
  AuthErrorDetailSeverity,
  AuthErrorDetails,
  AuthErrorOptions,
};
