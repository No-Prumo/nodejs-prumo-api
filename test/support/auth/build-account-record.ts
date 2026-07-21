import type { AccountRecord } from '@auth/application/ports/accounts.repository.types';
import type { BuildAccountRecordOverrides } from './build-account-record.types';

function buildAccountRecord(
  overrides: BuildAccountRecordOverrides = {},
): AccountRecord {
  const email = overrides.email ?? 'user@example.com';

  return {
    id: 'account-id',
    email,
    normalizedEmail: overrides.normalizedEmail ?? email.toLowerCase(),
    displayName: 'User',
    status: 'active',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export { buildAccountRecord };
