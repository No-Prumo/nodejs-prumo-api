import { readFileSync } from 'node:fs';
import path from 'node:path';

type ReferenceObject = {
  $ref: string;
};

type SchemaObject = {
  allOf?: Array<SchemaObject | ReferenceObject>;
  enum?: unknown[];
  properties?: Record<string, SchemaObject | ReferenceObject>;
};

type ResponseObject = {
  content?: Record<
    string,
    {
      schema?: SchemaObject | ReferenceObject;
    }
  >;
};

type OperationObject = {
  responses?: Record<string, ResponseObject | ReferenceObject | undefined>;
};

type PathItemObject = Partial<
  Record<'get' | 'post' | 'put' | 'patch' | 'delete', OperationObject>
>;

type OpenApiContractDocument = {
  components?: {
    schemas?: Record<string, SchemaObject | ReferenceObject>;
  };
  paths: Record<string, PathItemObject>;
};

const openApiArtifactPath = path.resolve('openapi', 'sandicts-api.json');
const openApiDocument = JSON.parse(
  readFileSync(openApiArtifactPath, 'utf8'),
) as OpenApiContractDocument;

const expectedOperations = {
  'GET /health/live': {
    success: ['200'],
    errors: {},
  },
  'GET /health/ready': {
    success: ['200', '503'],
    errors: {},
  },
  'POST /auth/google/sign-in': {
    success: ['200'],
    errors: {
      '400': ['validation_error'],
      '401': ['invalid_google_credential'],
      '403': ['account_auth_forbidden'],
      '409': ['external_identity_conflict'],
      '429': ['rate_limited'],
      '500': ['internal_error'],
    },
  },
  'POST /auth/refresh': {
    success: ['200'],
    errors: {
      '401': [
        'invalid_refresh_token',
        'refresh_token_expired',
        'refresh_token_reused',
        'refresh_token_revoked',
        'auth_session_inactive',
      ],
      '403': ['account_auth_forbidden'],
      '429': ['rate_limited'],
      '500': ['internal_error'],
    },
  },
  'POST /auth/magic-link/request': {
    success: ['202'],
    errors: {
      '400': ['validation_error'],
      '429': ['rate_limited'],
      '500': ['internal_error'],
      '503': ['email_delivery_unavailable'],
    },
  },
  'POST /auth/magic-link/consume': {
    success: ['200'],
    errors: {
      '400': ['validation_error'],
      '401': ['invalid_magic_link_token'],
      '403': ['account_auth_forbidden'],
      '409': ['magic_link_already_used', 'magic_link_superseded'],
      '410': ['magic_link_expired'],
      '429': ['rate_limited'],
      '500': ['internal_error'],
    },
  },
  'POST /auth/sign-out': {
    success: ['204'],
    errors: {
      '401': ['invalid_access_token'],
      '429': ['rate_limited'],
      '500': ['internal_error'],
    },
  },
  'POST /auth/sign-out-all': {
    success: ['204'],
    errors: {
      '401': ['invalid_access_token'],
      '429': ['rate_limited'],
      '500': ['internal_error'],
    },
  },
  'GET /auth/me': {
    success: ['200'],
    errors: {
      '401': ['invalid_access_token', 'auth_session_inactive'],
      '403': ['account_auth_forbidden'],
      '429': ['rate_limited'],
      '500': ['internal_error'],
    },
  },
  'GET /players/me': {
    success: ['200'],
    errors: {
      '401': ['invalid_access_token', 'auth_session_inactive'],
      '403': ['account_auth_forbidden'],
      '429': ['rate_limited'],
      '500': ['internal_error'],
    },
  },
  'POST /players/me': {
    success: ['201'],
    errors: {
      '400': ['validation_error'],
      '401': ['invalid_access_token', 'auth_session_inactive'],
      '403': ['account_auth_forbidden'],
      '409': ['conflict'],
      '429': ['rate_limited'],
      '500': ['internal_error'],
    },
  },
  'PATCH /players/me': {
    success: ['200'],
    errors: {
      '400': ['validation_error'],
      '401': ['invalid_access_token', 'auth_session_inactive'],
      '403': ['account_auth_forbidden'],
      '404': ['resource_not_found'],
      '429': ['rate_limited'],
      '500': ['internal_error'],
    },
  },
  'GET /sports': {
    success: ['200'],
    errors: {
      '429': ['rate_limited'],
      '500': ['internal_error'],
    },
  },
} as const;

describe('OpenAPI contract', () => {
  it('documents every public operation in the semantic contract matrix', () => {
    expect(readDocumentOperationKeys()).toEqual(
      Object.keys(expectedOperations).sort(),
    );
  });

  it.each(Object.entries(expectedOperations))(
    '%s exposes the expected success and error responses',
    (operationKey, expected) => {
      const operation = readOperation(operationKey);
      const expectedStatuses = [
        ...expected.success,
        ...Object.keys(expected.errors),
      ].sort();

      expect(Object.keys(operation.responses ?? {}).sort()).toEqual(
        expectedStatuses,
      );

      for (const [status, codes] of Object.entries(expected.errors)) {
        const schema = readJsonResponseSchema(operation, status);

        expect(schema.allOf).toEqual([
          { $ref: '#/components/schemas/ApiErrorResponse' },
        ]);
        expect(readPropertyEnum(schema, 'statusCode')).toEqual([
          Number(status),
        ]);
        expect(readPropertyEnum(schema, 'code')).toEqual(codes);
      }
    },
  );

  it('publishes one reusable public error envelope', () => {
    const schema = openApiDocument.components?.schemas?.ApiErrorResponse;

    expect(schema).toMatchObject({
      type: 'object',
      required: [
        'statusCode',
        'code',
        'message',
        'path',
        'timestamp',
        'requestId',
      ],
      properties: {
        statusCode: { type: 'integer' },
        code: { type: 'string' },
        message: { type: 'string' },
        path: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        requestId: { type: 'string' },
        issues: { type: 'array' },
      },
    });
  });
});

function readDocumentOperationKeys() {
  const operationKeys: string[] = [];

  for (const [route, pathItem] of Object.entries(openApiDocument.paths)) {
    for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
      if (pathItem?.[method]) {
        operationKeys.push(`${method.toUpperCase()} ${route}`);
      }
    }
  }

  return operationKeys.sort();
}

function readOperation(operationKey: string): OperationObject {
  const [method, route] = operationKey.split(' ');
  const pathItem = openApiDocument.paths[route];
  const operation =
    pathItem?.[
      method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete'
    ];

  if (!operation) {
    throw new Error(`Missing OpenAPI operation: ${operationKey}`);
  }

  return operation;
}

function readJsonResponseSchema(
  operation: OperationObject,
  status: string,
): SchemaObject {
  const response = operation.responses?.[status];

  if (!response || isReferenceObject(response)) {
    throw new Error(`Missing inline OpenAPI response for status ${status}`);
  }

  const schema = response.content?.['application/json']?.schema;

  if (!schema || isReferenceObject(schema)) {
    throw new Error(`Missing inline JSON schema for status ${status}`);
  }

  return schema;
}

function readPropertyEnum(schema: SchemaObject, propertyName: string) {
  const property = schema.properties?.[propertyName];

  if (!property || isReferenceObject(property)) {
    throw new Error(`Missing inline property schema: ${propertyName}`);
  }

  return property.enum;
}

function isReferenceObject(
  value: ReferenceObject | SchemaObject | ResponseObject,
): value is ReferenceObject {
  return '$ref' in value;
}
