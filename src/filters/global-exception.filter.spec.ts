import {
  BadRequestException,
  UnauthorizedException,
  type ArgumentsHost,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { z } from 'zod';
import { AppError } from '../shared/errors/app-error';
import { GlobalExceptionFilter } from './global-exception.filter';

type MockHttpResponse = {
  body?: unknown;
  response: Response;
  statusCode?: number;
};

type ResponseBody = {
  code: string;
  issues?: unknown[];
  message: string;
  path: string;
  requestId: string;
  statusCode: number;
  timestamp: string;
};

function createArgumentsHost(
  request: Request,
  response: Response,
): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getNext: () => undefined,
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as ArgumentsHost;
}

function createRequest(path: string): Request {
  return {
    headers: {},
    originalUrl: path,
    url: path,
  } as Request;
}

function createResponse(requestId = 'req-123'): MockHttpResponse {
  const mockResponse: MockHttpResponse = {
    response: {} as Response,
  };

  mockResponse.response = {
    getHeader: vi.fn((headerName: string) =>
      headerName === 'X-Request-Id' ? requestId : undefined,
    ),
    json: vi.fn((body: unknown) => {
      mockResponse.body = body;

      return mockResponse.response;
    }),
    status: vi.fn((statusCode: number) => {
      mockResponse.statusCode = statusCode;

      return mockResponse.response;
    }),
  } as unknown as Response;

  return mockResponse;
}

function createLogger() {
  const error = vi.fn();
  const setContext = vi.fn();

  return {
    error,
    logger: {
      error,
      setContext,
    } as unknown as PinoLogger,
    setContext,
  };
}

function getZodError() {
  const result = z
    .object({
      name: z.string().min(2),
    })
    .safeParse({
      name: 'a',
    });

  if (result.success) {
    throw new Error('Expected Zod parsing to fail');
  }

  return result.error;
}

function getResponseBody(mockResponse: MockHttpResponse): ResponseBody {
  expect(mockResponse.body).toBeDefined();

  return mockResponse.body as ResponseBody;
}

describe('GlobalExceptionFilter', () => {
  it('normalizes AppError without additional logging', () => {
    const logger = createLogger();
    const filter = new GlobalExceptionFilter(logger.logger);
    const request = createRequest('/orders/123/cancel');
    const mockResponse = createResponse();
    const host = createArgumentsHost(request, mockResponse.response);

    filter.catch(
      new AppError('business_rule_violation', 'Cannot cancel a paid order', {
        details: {
          orderId: '123',
        },
      }),
      host,
    );

    expect(mockResponse.statusCode).toBe(422);
    const body = getResponseBody(mockResponse);

    expect(body).toMatchObject({
      code: 'business_rule_violation',
      message: 'Cannot cancel a paid order',
      path: '/orders/123/cancel',
      requestId: 'req-123',
      statusCode: 422,
    });
    expect(typeof body.timestamp).toBe('string');
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('normalizes HttpException 4xx without additional logging', () => {
    const logger = createLogger();
    const filter = new GlobalExceptionFilter(logger.logger);
    const request = createRequest('/admin');
    const mockResponse = createResponse();
    const host = createArgumentsHost(request, mockResponse.response);

    filter.catch(new UnauthorizedException(), host);

    expect(mockResponse.statusCode).toBe(401);
    const body = getResponseBody(mockResponse);

    expect(body).toMatchObject({
      code: 'unauthorized',
      message: 'Unauthorized',
      path: '/admin',
      requestId: 'req-123',
      statusCode: 401,
    });
    expect(typeof body.timestamp).toBe('string');
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('maps Zod validation failures to validation_error with public issues', () => {
    const logger = createLogger();
    const filter = new GlobalExceptionFilter(logger.logger);
    const request = createRequest('/orders');
    const mockResponse = createResponse();
    const host = createArgumentsHost(request, mockResponse.response);

    filter.catch(new ZodValidationException(getZodError()), host);

    expect(mockResponse.statusCode).toBe(400);
    const body = getResponseBody(mockResponse);

    expect(body).toMatchObject({
      code: 'validation_error',
      message: 'Validation failed',
      path: '/orders',
      requestId: 'req-123',
      statusCode: 400,
    });
    expect(typeof body.timestamp).toBe('string');
    expect(Array.isArray(body.issues)).toBe(true);
    expect(body.issues).toHaveLength(1);

    const [firstIssue] = body.issues ?? [];

    expect(firstIssue).toMatchObject({
      path: ['name'],
    });

    if (typeof firstIssue === 'object' && firstIssue !== null) {
      expect(typeof firstIssue.message).toBe('string');
    }

    expect(logger.error).not.toHaveBeenCalled();
  });

  it('keeps generic bad requests separate from validation errors', () => {
    const logger = createLogger();
    const filter = new GlobalExceptionFilter(logger.logger);
    const request = createRequest('/orders');
    const mockResponse = createResponse();
    const host = createArgumentsHost(request, mockResponse.response);

    filter.catch(
      new BadRequestException({
        message: ['missing order id', 'invalid tenant'],
      }),
      host,
    );

    expect(mockResponse.statusCode).toBe(400);
    const body = getResponseBody(mockResponse);

    expect(body).toMatchObject({
      code: 'bad_request',
      message: 'missing order id, invalid tenant',
      path: '/orders',
      requestId: 'req-123',
      statusCode: 400,
    });
    expect(typeof body.timestamp).toBe('string');
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('logs and hides internals for unexpected errors', () => {
    const logger = createLogger();
    const filter = new GlobalExceptionFilter(logger.logger);
    const request = createRequest('/orders');
    const mockResponse = createResponse();
    const host = createArgumentsHost(request, mockResponse.response);

    filter.catch(new Error('database is down'), host);

    expect(mockResponse.statusCode).toBe(500);
    const body = getResponseBody(mockResponse);

    expect(body).toMatchObject({
      code: 'internal_error',
      message: 'Internal server error',
      path: '/orders',
      requestId: 'req-123',
      statusCode: 500,
    });
    expect(typeof body.timestamp).toBe('string');
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'internal_error',
        exceptionName: 'Error',
        originalMessage: 'database is down',
        path: '/orders',
        requestId: 'req-123',
        statusCode: 500,
      }),
      'Unexpected exception handled',
    );
  });

  it('reinforces logging for internal HTTP exceptions only', () => {
    const logger = createLogger();
    const filter = new GlobalExceptionFilter(logger.logger);
    const request = createRequest('/orders');
    const mockResponse = createResponse();
    const host = createArgumentsHost(request, mockResponse.response);

    filter.catch(new ZodSerializationException(getZodError()), host);

    expect(mockResponse.statusCode).toBe(500);
    const body = getResponseBody(mockResponse);

    expect(body).toMatchObject({
      code: 'internal_error',
      message: 'Internal server error',
      path: '/orders',
      requestId: 'req-123',
      statusCode: 500,
    });
    expect(typeof body.timestamp).toBe('string');
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'internal_error',
        exceptionName: 'ZodSerializationException',
        originalMessage: 'Internal Server Error',
        path: '/orders',
        requestId: 'req-123',
        statusCode: 500,
      }),
      'Internal HTTP exception handled',
    );
  });
});
