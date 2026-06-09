const accountStatuses = ['active', 'blocked', 'disabled'] as const;

type AccountStatus = (typeof accountStatuses)[number];

export { accountStatuses };
export type { AccountStatus };
