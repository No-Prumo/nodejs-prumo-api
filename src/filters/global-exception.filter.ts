import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import {
  ZodSchemaDeclarationException,
  ZodSerializationException,
  ZodValidationException,
} from 'nestjs-zod';
import { AppError } from '../shared/errors/app-error';
import { type ErrorCode, isErrorCode } from '../shared/errors/error-codes';

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

type NormalizedException = {
  details?: unknown;
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

const REQUEST_ID_HEADERS = ['X-Request-Id', 'X-Correlation-Id'] as const;

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(GlobalExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const normalizedException = this.normalizeException(
      exception,
      request,
      response,
    );

    if (normalizedException.shouldLog) {
      this.logger.error(
        {
          code: normalizedException.responseBody.code,
          details: normalizedException.details,
          exceptionName: getExceptionName(exception),
          originalMessage: normalizedException.originalMessage,
          path: normalizedException.responseBody.path,
          requestId: normalizedException.responseBody.requestId,
          statusCode: normalizedException.responseBody.statusCode,
        },
        normalizedException.logMessage,
      );
    }

    response
      .status(normalizedException.responseBody.statusCode)
      .json(normalizedException.responseBody);
  }

  private normalizeException(
    exception: unknown,
    request: Request,
    response: Response,
  ): NormalizedException {
    const path = getRequestPath(request);
    const requestId = getRequestId(request, response);
    const timestamp = new Date().toISOString();

    if (exception instanceof ZodValidationException) {
      return {
        responseBody: {
          code: 'validation_error',
          issues: getIssuesFromUnknown(exception.getZodError()),
          message: 'Validation failed',
          path,
          requestId,
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp,
        },
        shouldLog: false,
      };
    }

    if (exception instanceof AppError) {
      return {
        details: exception.details,
        responseBody: {
          code: exception.code,
          message: exception.message,
          path,
          requestId,
          statusCode: mapAppErrorCodeToStatus(exception.code),
          timestamp,
        },
        shouldLog: false,
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse =
        exception.getResponse() as HttpExceptionResponseBody;
      const shouldLog = isInternalHttpException(exception);

      const code =
        isHttpValidationError(exception) ||
        isHttpValidationPayload(exceptionResponse)
          ? 'validation_error'
          : getHttpExceptionCode(exceptionResponse, statusCode);

      const message = shouldLog
        ? 'Internal server error'
        : code === 'validation_error'
          ? 'Validation failed'
          : getHttpExceptionMessage(exceptionResponse, exception.message);

      return {
        logMessage: shouldLog ? 'Internal HTTP exception handled' : undefined,
        originalMessage: exception.message,
        responseBody: {
          code,
          issues:
            code === 'validation_error'
              ? getHttpValidationIssues(exceptionResponse)
              : undefined,
          message,
          path,
          requestId,
          statusCode,
          timestamp,
        },
        shouldLog,
      };
    }

    return {
      details: exception,
      logMessage: 'Unexpected exception handled',
      originalMessage:
        exception instanceof Error ? exception.message : 'Unexpected error',
      responseBody: {
        code: 'internal_error',
        message: 'Internal server error',
        path,
        requestId,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp,
      },
      shouldLog: true,
    };
  }
}

function getHttpExceptionCode(
  exceptionResponse: HttpExceptionResponseBody,
  statusCode: number,
): ErrorCode {
  if (
    typeof exceptionResponse === 'object' &&
    exceptionResponse !== null &&
    isErrorCode(exceptionResponse.code)
  ) {
    return exceptionResponse.code;
  }

  return mapHttpStatusToErrorCode(statusCode);
}

function getHttpExceptionMessage(
  exceptionResponse: HttpExceptionResponseBody,
  fallbackMessage: string,
) {
  if (
    typeof exceptionResponse === 'string' &&
    exceptionResponse.trim().length > 0
  ) {
    return exceptionResponse;
  }

  if (typeof exceptionResponse !== 'object' || exceptionResponse === null) {
    return fallbackMessage;
  }

  if (typeof exceptionResponse.message === 'string') {
    return exceptionResponse.message;
  }

  if (Array.isArray(exceptionResponse.message)) {
    const messages = exceptionResponse.message.filter(
      (message): message is string =>
        typeof message === 'string' && message.trim().length > 0,
    );

    if (messages.length > 0) {
      return messages.join(', ');
    }
  }

  if (typeof exceptionResponse.error === 'string') {
    return exceptionResponse.error;
  }

  return fallbackMessage;
}

function getHttpValidationIssues(exceptionResponse: HttpExceptionResponseBody) {
  if (hasErrors(exceptionResponse)) {
    return exceptionResponse.errors;
  }

  if (hasIssues(exceptionResponse)) {
    return exceptionResponse.issues;
  }

  return undefined;
}

function getRequestId(request: Request, response: Response) {
  for (const headerName of REQUEST_ID_HEADERS) {
    const headerValue = response.getHeader(headerName);

    if (typeof headerValue === 'string' && headerValue.trim().length > 0) {
      return headerValue;
    }
  }

  const requestIdHeader = request.headers['x-request-id'];

  if (
    typeof requestIdHeader === 'string' &&
    requestIdHeader.trim().length > 0
  ) {
    return requestIdHeader.trim();
  }

  const correlationIdHeader = request.headers['x-correlation-id'];

  if (
    typeof correlationIdHeader === 'string' &&
    correlationIdHeader.trim().length > 0
  ) {
    return correlationIdHeader.trim();
  }

  return 'unknown';
}

function getRequestPath(request: Request) {
  return request.originalUrl ?? request.url ?? '/';
}

function getExceptionName(exception: unknown) {
  if (exception instanceof Error) {
    return exception.name;
  }

  return typeof exception;
}

function isHttpValidationError(exception: HttpException) {
  return exception instanceof ZodValidationException;
}

function isHttpValidationPayload(exceptionResponse: HttpExceptionResponseBody) {
  return hasErrors(exceptionResponse) || hasIssues(exceptionResponse);
}

function isInternalHttpException(exception: HttpException) {
  return (
    exception instanceof ZodSerializationException ||
    exception instanceof ZodSchemaDeclarationException ||
    exception.getStatus() >= 500
  );
}

function mapAppErrorCodeToStatus(code: AppError['code']) {
  switch (code) {
    case 'unauthorized':
      return 401;
    case 'forbidden':
      return 403;
    case 'resource_not_found':
      return 404;
    case 'conflict':
      return 409;
    case 'business_rule_violation':
      return 422;
  }
}

function mapHttpStatusToErrorCode(statusCode: number): ErrorCode {
  switch (statusCode) {
    case 400:
      return 'bad_request';
    case 401:
      return 'unauthorized';
    case 403:
      return 'forbidden';
    case 404:
      return 'resource_not_found';
    case 409:
      return 'conflict';
    case 422:
      return 'business_rule_violation';
    default:
      return statusCode >= 500 ? 'internal_error' : 'bad_request';
  }
}

function getIssuesFromUnknown(value: unknown) {
  return hasIssues(value) ? value.issues : undefined;
}

function hasErrors(value: HttpExceptionResponseBody): value is Extract<
  HttpExceptionResponseBody,
  { errors?: unknown }
> & {
  errors: unknown[];
} {
  return (
    typeof value === 'object' && value !== null && Array.isArray(value.errors)
  );
}

function hasIssues(value: unknown): value is {
  issues: unknown[];
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'issues' in value &&
    Array.isArray(value.issues)
  );
}
