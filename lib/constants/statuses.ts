export const STATUS_NAMES = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type StatusName = typeof STATUS_NAMES[keyof typeof STATUS_NAMES];

export const TERMINAL_STATUSES: StatusName[] = ['completed', 'cancelled'];