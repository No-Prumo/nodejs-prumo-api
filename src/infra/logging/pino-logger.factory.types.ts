import type { IncomingMessage } from 'node:http';

type RequestLike = IncomingMessage & {
  originalUrl?: string;
};

type TraceContext = {
  spanId: string;
  traceId: string;
};

export type { RequestLike, TraceContext };
