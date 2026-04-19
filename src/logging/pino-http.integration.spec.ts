import { once } from 'node:events';
import { createServer, request as httpRequest } from 'node:http';
import type { AddressInfo } from 'node:net';
import { PassThrough } from 'node:stream';
import type { Params } from 'nestjs-pino';
import pinoHttp, { type Options } from 'pino-http';
import { describe, expect, it } from 'vitest';
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

function getPinoHttpOptions(): Options {
  const params = createPinoLoggerOptions(
    appSettings,
    loggerSettings,
    observabilitySettings,
  ) as Params & {
    pinoHttp: Options;
  };

  return {
    ...params.pinoHttp,
    transport: undefined,
  };
}

async function makeRequest(
  port: number,
  headers: Record<string, string>,
): Promise<void> {
  await new Promise((resolve, reject) => {
    const request = httpRequest(
      {
        headers,
        host: '127.0.0.1',
        method: 'GET',
        path: '/',
        port,
      },
      (response) => {
        response.resume();
        response.on('end', resolve);
      },
    );

    request.on('error', reject);
    request.end();
  });
}

describe('pino-http integration', () => {
  it('emits a compact structured log with a single canonical requestId', async () => {
    const destination = new PassThrough();
    let output = '';

    destination.setEncoding('utf8');
    destination.on('data', (chunk: string) => {
      output += chunk;
    });

    const logger = pinoHttp(getPinoHttpOptions(), destination);
    const server = createServer((request, response) => {
      logger(request, response);
      response.statusCode = 200;
      response.end('ok');
    });

    server.listen(0, '127.0.0.1');
    await once(server, 'listening');

    const { port } = server.address() as AddressInfo;
    const firstLogChunk = once(destination, 'data');

    try {
      await makeRequest(port, {
        authorization: 'Bearer super-secret',
        traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
        'user-agent': 'vitest-client',
        'x-request-id': 'review-123',
      });
      await firstLogChunk;
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
      destination.end();
    }

    const [logLine] = output
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    expect(logLine).toBeDefined();

    const parsedLog = JSON.parse(logLine) as {
      durationMs: number;
      env: string;
      request: {
        headers?: Record<string, string>;
        method?: string;
        remoteAddress?: string;
        remotePort?: number;
        url?: string;
      };
      requestId: string;
      response: {
        statusCode: number;
      };
      service: string;
      spanId: string;
      traceId: string;
      version: string;
    };

    expect(parsedLog).toMatchObject({
      env: 'staging',
      request: {
        method: 'GET',
        url: '/',
      },
      requestId: 'review-123',
      response: {
        statusCode: 200,
      },
      service: 'nodejs-prumo-api',
      spanId: '00f067aa0ba902b7',
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      version: '1.2.3',
    });
    expect(parsedLog.durationMs).toBeTypeOf('number');
    expect(parsedLog.request.headers).toMatchObject({
      host: `127.0.0.1:${port}`,
      'user-agent': 'vitest-client',
    });
    expect(parsedLog.request.headers).not.toHaveProperty('authorization');
    expect(parsedLog.request).not.toHaveProperty('id');
    expect(parsedLog.request).not.toHaveProperty('_events');
    expect(parsedLog.response).not.toHaveProperty('_header');
  });
});
