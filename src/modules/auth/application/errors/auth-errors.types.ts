import type { AppErrorCode } from '../../../../shared/errors/error-codes';

type AuthErrorDetailSeverity = 'auth' | 'security';

type AuthErrorContext = {
  accountId?: string;
  action?: string;
  refreshTokenFamilyId?: string;
  reason?: string;
  sessionId?: string;
  severity?: AuthErrorDetailSeverity;
  status?: string;
};

type AuthErrorDetails = AuthErrorContext & {
  area: 'auth';
  code: AppErrorCode;
  severity: AuthErrorDetailSeverity;
};

export type { AuthErrorContext, AuthErrorDetailSeverity, AuthErrorDetails };
