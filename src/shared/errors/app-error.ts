import type { AppErrorCode } from './error-codes';

type AppErrorOptions = {
  cause?: unknown;
  details?: unknown;
};

class AppError extends Error {
  readonly code: AppErrorCode;
  readonly details?: unknown;

  constructor(
    code: AppErrorCode,
    message: string,
    options: AppErrorOptions = {},
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = 'AppError';
    this.code = code;
    this.details = options.details;

    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export { AppError };
export type { AppErrorOptions };
