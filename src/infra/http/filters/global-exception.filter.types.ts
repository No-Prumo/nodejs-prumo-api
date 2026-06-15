import type { ErrorCode } from '../../../shared/errors/error-codes';

type ErrorResponseBody = {
  code: ErrorCode;
  details?: never;
  issues?: unknown[];
  message: string;
  path: string;
  requestId: string;
  statusCode: number;
  timestamp: string;
};

type ExceptionLogLevel = 'error' | 'warn';

type NormalizedException = {
  details?: unknown;
  logLevel?: ExceptionLogLevel;
  logMessage?: string;
  originalMessage?: string;
  responseBody: ErrorResponseBody;
  shouldLog: boolean;
};

type HttpExceptionResponseBody =
  | string
  | {
      code?: unknown;
      error?: unknown;
      errors?: unknown;
      issues?: unknown;
      message?: unknown;
    };

export type {
  ErrorResponseBody,
  ExceptionLogLevel,
  HttpExceptionResponseBody,
  NormalizedException,
};
