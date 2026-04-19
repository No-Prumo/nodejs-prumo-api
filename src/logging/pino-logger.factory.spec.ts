import type { ServerResponse } from 'node:http';
import type { Options } from 'pino-http';
import { describe, expect, it, vi } from 'vitest';
import { createPinoLoggerOptions } from './pino-logger.factory';

const appSettings = {
  environment: 'staging',
  globalPrefix: 'api',
  host: '0.0.0.0',
  isDevelopmentRuntime: false,
  isLocalEnvironment: false,
  isProductionEnvironment: false,
  isProductionRuntime: true,
  isStagingEnvironment: true,
  isTestEnvironment: false,
  isTestRuntime: false,
  nodeEnv: 'production',
  port: 3000,
  version: '1.2.3',
} as const;

const loggerSettings = {
  level: 'info',
  pretty: false,
} as const;

const observabilitySettings = {
  enabled: false,
  serviceName: 'nodejs-prumo-api',
} as const;

describe('createPinoLoggerOptions', () => {
  it('reuses incoming correlation identifiers and mirrors them in response headers', () => {
    const options = createPinoLoggerOptions(
      appSettings,
      loggerSettings,
      observabilitySettings,
    ) as ReturnType<typeof createPinoLoggerOptions> & {
      pinoHttp: Options;
    };

    const request = {
      headers: {
        'x-correlation-id': 'corr-123',
      },
    };

    const setHeader = vi.fn();
    const response = {
      setHeader,
    } as unknown as ServerResponse;

    const requestId = options.pinoHttp.genReqId?.(
      request as never,
      response as never,
    );

    expect(requestId).toBe('corr-123');
    expect(setHeader).toHaveBeenCalledWith('X-Request-Id', 'corr-123');
    expect(setHeader).toHaveBeenCalledWith('X-Correlation-Id', 'corr-123');
  });

  it('extracts trace context from a valid traceparent header', () => {
    const options = createPinoLoggerOptions(
      appSettings,
      loggerSettings,
      observabilitySettings,
    ) as ReturnType<typeof createPinoLoggerOptions> & {
      pinoHttp: Options;
    };

    const customProps = options.pinoHttp.customProps?.(
      {
        headers: {
          traceparent:
            '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
        },
      } as never,
      {} as never,
    );

    expect(customProps).toEqual({
      spanId: '00f067aa0ba902b7',
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
    });
  });

  it('uses the renamed HTTP keys as serializer keys to keep request logs compact', () => {
    const options = createPinoLoggerOptions(
      appSettings,
      loggerSettings,
      observabilitySettings,
    ) as ReturnType<typeof createPinoLoggerOptions> & {
      pinoHttp: Options;
    };

    expect(options.pinoHttp.customAttributeKeys).toEqual({
      err: 'error',
      req: 'request',
      reqId: 'requestId',
      res: 'response',
      responseTime: 'durationMs',
    });

    const serializers = options.pinoHttp.serializers as Record<string, unknown>;

    expect(serializers.error).toBeTypeOf('function');
    expect(serializers.request).toBeTypeOf('function');
    expect(serializers.response).toBeTypeOf('function');
  });
});
