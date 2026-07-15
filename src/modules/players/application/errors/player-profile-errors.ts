import { AppError } from '@shared/errors/app-error';
import type { AppErrorCode } from '@shared/errors/error-codes';

type PlayerProfileErrorContext = {
  accountId?: string;
  action?: string;
  cause?: unknown;
  reason?: string;
};

function currentPlayerProfileAlreadyExists(
  context: PlayerProfileErrorContext = {},
): AppError {
  return playerProfileError(
    'conflict',
    'Current player profile already exists',
    context,
  );
}

function currentPlayerProfileNotFound(
  context: PlayerProfileErrorContext = {},
): AppError {
  return playerProfileError(
    'resource_not_found',
    'Current player profile was not found',
    context,
  );
}

function playerProfileError(
  code: AppErrorCode,
  message: string,
  context: PlayerProfileErrorContext,
): AppError {
  return new AppError(code, message, {
    cause: context.cause,
    details: {
      area: 'players',
      accountId: context.accountId,
      action: context.action,
      code,
      reason: context.reason,
    },
  });
}

export { currentPlayerProfileAlreadyExists, currentPlayerProfileNotFound };
