import { randomUUID } from 'node:crypto';
import type {
  IncomingHttpHeaders,
  IncomingMessage,
  ServerResponse,
} from 'node:http';
import type { Params } from 'nestjs-pino';
import { stdSerializers, stdTimeFunctions } from 'pino';
import type { AppConfig, LoggerConfig, ObservabilityConfig } from '../config';

const REQUEST_ID_HEADER = 'x-request-id';
const CORRELATION_ID_HEADER = 'x-correlation-id';
const TRACEPARENT_HEADER = 'traceparent';
const HTTP_LOG_ATTRIBUTE_KEYS = {
  err: 'error',
  req: 'request',
  reqId: 'requestId',
  res: 'response',
  responseTime: 'durationMs',
} as const;

const REQUEST_LOG_HEADER_NAMES = [
  'host',
  'user-agent',
  'content-type',
  'content-length',
  'x-forwarded-for',
  'x-forwarded-proto',
] as const;

const REDACT_PATHS = [
  'request.headers.authorization',
  'request.headers.cookie',
  'request.headers["set-cookie"]',
  'request.headers["x-api-key"]',
  'request.body.password',
  'request.body.currentPassword',
  'request.body.newPassword',
  'request.body.confirmPassword',
  'request.body.token',
  'request.body.accessToken',
  'request.body.refreshToken',
  'request.body.secret',
  'body.password',
  'body.currentPassword',
  'body.newPassword',
  'body.confirmPassword',
  'body.token',
  'body.accessToken',
  'body.refreshToken',
  'body.secret',
] as const;

type RequestLike = IncomingMessage & {
  originalUrl?: string;
};

type TraceContext = {
  spanId: string;
  traceId: string;
};

function getHeaderValue(
  headers: IncomingHttpHeaders,
  headerName: string,
): string | undefined {
  const headerValue = headers[headerName];

  if (Array.isArray(headerValue)) {
    return headerValue.find((value) => value.trim().length > 0)?.trim();
  }

  return typeof headerValue === 'string' && headerValue.trim().length > 0
    ? headerValue.trim()
    : undefined;
}

function getRequestUrl(
  request: Pick<RequestLike, 'method' | 'originalUrl' | 'url'>,
) {
  return request.originalUrl ?? request.url ?? '/';
}

function createRequestId(
  request: RequestLike,
  response: ServerResponse,
): string {
  const requestId =
    getHeaderValue(request.headers, REQUEST_ID_HEADER) ??
    getHeaderValue(request.headers, CORRELATION_ID_HEADER) ??
    randomUUID();

  response.setHeader('X-Request-Id', requestId);
  response.setHeader('X-Correlation-Id', requestId);

  return requestId;
}

function serializeHeaders(headers: IncomingHttpHeaders) {
  const serializedHeaders = REQUEST_LOG_HEADER_NAMES.reduce<
    Record<string, string>
  >((accumulator, headerName) => {
    const headerValue = getHeaderValue(headers, headerName);

    if (headerValue) {
      accumulator[headerName] = headerValue;
    }

    return accumulator;
  }, {});

  return Object.keys(serializedHeaders).length > 0
    ? serializedHeaders
    : undefined;
}

function serializeRequest(request: RequestLike) {
  return {
    headers: serializeHeaders(request.headers),
    method: request.method,
    remoteAddress: request.socket.remoteAddress,
    remotePort: request.socket.remotePort,
    url: getRequestUrl(request),
  };
}

function serializeResponse(response: ServerResponse) {
  return {
    statusCode: response.statusCode,
  };
}

function extractTraceContext(
  headers: IncomingHttpHeaders,
): Partial<TraceContext> {
  const traceparent = getHeaderValue(headers, TRACEPARENT_HEADER);

  if (!traceparent) {
    return {};
  }

  const [version, traceId, spanId, traceFlags] = traceparent.split('-');

  const isTraceparentValid =
    version?.length === 2 &&
    traceFlags?.length === 2 &&
    /^[\da-f]{32}$/i.test(traceId ?? '') &&
    !/^0{32}$/i.test(traceId ?? '') &&
    /^[\da-f]{16}$/i.test(spanId ?? '') &&
    !/^0{16}$/i.test(spanId ?? '');

  if (!isTraceparentValid) {
    return {};
  }

  return {
    spanId: spanId.toLowerCase(),
    traceId: traceId.toLowerCase(),
  };
}

function createPrettyTransport(enabled: boolean) {
  if (!enabled) {
    return undefined;
  }

  return {
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      singleLine: false,
      translateTime: 'SYS:standard',
    },
    target: 'pino-pretty',
  };
}

const httpLogSerializers = {
  [HTTP_LOG_ATTRIBUTE_KEYS.err]: stdSerializers.err,
  [HTTP_LOG_ATTRIBUTE_KEYS.req]: serializeRequest,
  [HTTP_LOG_ATTRIBUTE_KEYS.res]: serializeResponse,
};

export function createPinoLoggerOptions(
  appSettings: AppConfig,
  loggerSettings: LoggerConfig,
  observabilitySettings: ObservabilityConfig,
): Params {
  return {
    pinoHttp: {
      autoLogging: true,
      base: {
        env: appSettings.environment,
        service: observabilitySettings.serviceName,
        version: appSettings.version,
      },
      customAttributeKeys: HTTP_LOG_ATTRIBUTE_KEYS,
      customErrorMessage: (request, response) =>
        `${request.method} ${getRequestUrl(request)} failed with status ${response.statusCode}`,
      customLogLevel: (_request, response, error) => {
        if (error || response.statusCode >= 500) {
          return 'error';
        }

        if (response.statusCode >= 400) {
          return 'warn';
        }

        return 'info';
      },
      customProps: (request) => extractTraceContext(request.headers),
      customSuccessMessage: (request, response) =>
        `${request.method} ${getRequestUrl(request)} completed with status ${response.statusCode}`,
      genReqId: createRequestId,
      level: loggerSettings.level,
      quietReqLogger: true,
      redact: {
        censor: '[Redacted]',
        paths: [...REDACT_PATHS],
      },
      serializers: httpLogSerializers,
      timestamp: stdTimeFunctions.isoTime,
      transport: createPrettyTransport(loggerSettings.pretty),
      wrapSerializers: false,
    },
  };
}
