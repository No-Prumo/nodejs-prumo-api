import type { authErrorReasons } from './auth-error-reasons';

type AuthErrorReason = (typeof authErrorReasons)[keyof typeof authErrorReasons];

export type { AuthErrorReason };
