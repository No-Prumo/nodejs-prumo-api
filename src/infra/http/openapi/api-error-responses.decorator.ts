import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import type { ErrorCodeForStatus } from '../errors/http-error-contract';
import { ApiErrorResponse } from './api-error-response.schemas';

type ApiErrorResponsesOptions = {
  badRequest?: readonly ErrorCodeForStatus<HttpStatus.BAD_REQUEST>[];
  unauthorized?: readonly ErrorCodeForStatus<HttpStatus.UNAUTHORIZED>[];
  forbidden?: readonly ErrorCodeForStatus<HttpStatus.FORBIDDEN>[];
  notFound?: readonly ErrorCodeForStatus<HttpStatus.NOT_FOUND>[];
  conflict?: readonly ErrorCodeForStatus<HttpStatus.CONFLICT>[];
  gone?: readonly ErrorCodeForStatus<HttpStatus.GONE>[];
  unprocessableEntity?: readonly ErrorCodeForStatus<HttpStatus.UNPROCESSABLE_ENTITY>[];
  tooManyRequests?: readonly ErrorCodeForStatus<HttpStatus.TOO_MANY_REQUESTS>[];
  internalServerError?: readonly ErrorCodeForStatus<HttpStatus.INTERNAL_SERVER_ERROR>[];
  serviceUnavailable?: readonly ErrorCodeForStatus<HttpStatus.SERVICE_UNAVAILABLE>[];
};

type ApiErrorResponseOptionKey = keyof ApiErrorResponsesOptions;

const responseDefinitions: readonly {
  key: ApiErrorResponseOptionKey;
  status: number;
  description: string;
}[] = [
  {
    key: 'badRequest',
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  },
  {
    key: 'unauthorized',
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication failed',
  },
  {
    key: 'forbidden',
    status: HttpStatus.FORBIDDEN,
    description: 'Access forbidden',
  },
  {
    key: 'notFound',
    status: HttpStatus.NOT_FOUND,
    description: 'Resource not found',
  },
  {
    key: 'conflict',
    status: HttpStatus.CONFLICT,
    description: 'Resource state conflict',
  },
  {
    key: 'gone',
    status: HttpStatus.GONE,
    description: 'Resource is no longer available',
  },
  {
    key: 'unprocessableEntity',
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Business rule rejected the request',
  },
  {
    key: 'tooManyRequests',
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Rate limit exceeded',
  },
  {
    key: 'internalServerError',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Unexpected internal failure',
  },
  {
    key: 'serviceUnavailable',
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Required dependency is unavailable',
  },
];

function ApiErrorResponses(options: ApiErrorResponsesOptions) {
  const responseDecorators = responseDefinitions.flatMap((definition) => {
    const codes = options[definition.key];

    if (!codes || codes.length === 0) {
      return [];
    }

    return [
      ApiResponse({
        status: definition.status,
        description: `${definition.description}. Codes: ${formatCodes(codes)}.`,
        schema: {
          allOf: [{ $ref: getSchemaPath(ApiErrorResponse) }],
          properties: {
            statusCode: {
              type: 'integer',
              enum: [definition.status],
            },
            code: {
              type: 'string',
              enum: [...codes],
            },
          },
        },
      }),
    ];
  });

  return applyDecorators(
    ApiExtraModels(ApiErrorResponse),
    ...responseDecorators,
  );
}

function formatCodes(codes: readonly string[]) {
  return codes.map((code) => `\`${code}\``).join(', ');
}

export { ApiErrorResponses };
export type { ApiErrorResponsesOptions };
