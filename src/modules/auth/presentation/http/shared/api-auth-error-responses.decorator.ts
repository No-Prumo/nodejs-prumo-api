import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import {
  AuthErrorResponseDto,
  AuthValidationErrorResponseDto,
} from './auth-error-response.schemas';

type ApiAuthErrorResponsesOptions = {
  conflict?: readonly string[];
  forbidden?: readonly string[];
  includeRateLimit?: boolean;
  includeValidation?: boolean;
  unauthorized?: readonly string[];
};

function ApiAuthErrorResponses(options: ApiAuthErrorResponsesOptions) {
  const decorators: Array<ClassDecorator | MethodDecorator> = [];

  if (options.includeValidation) {
    decorators.push(
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation failed. Code: validation_error.',
        type: AuthValidationErrorResponseDto,
      }),
    );
  }

  if (options.unauthorized && options.unauthorized.length > 0) {
    decorators.push(
      ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: `Unauthorized auth failure. Codes: ${formatCodes(
          options.unauthorized,
        )}.`,
        type: AuthErrorResponseDto,
      }),
    );
  }

  if (options.forbidden && options.forbidden.length > 0) {
    decorators.push(
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: `Forbidden auth failure. Codes: ${formatCodes(
          options.forbidden,
        )}.`,
        type: AuthErrorResponseDto,
      }),
    );
  }

  if (options.conflict && options.conflict.length > 0) {
    decorators.push(
      ApiResponse({
        status: HttpStatus.CONFLICT,
        description: `Auth conflict. Codes: ${formatCodes(options.conflict)}.`,
        type: AuthErrorResponseDto,
      }),
    );
  }

  if (options.includeRateLimit) {
    decorators.push(
      ApiResponse({
        status: HttpStatus.TOO_MANY_REQUESTS,
        description: 'Rate limit exceeded. Code: rate_limited.',
        type: AuthErrorResponseDto,
      }),
    );
  }

  return applyDecorators(...decorators);
}

function formatCodes(codes: readonly string[]) {
  return codes.map((code) => `\`${code}\``).join(', ');
}

export { ApiAuthErrorResponses };
