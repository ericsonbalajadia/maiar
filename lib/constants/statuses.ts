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

export const STATUS_TRANSITIONS: Record<StatusName, StatusName[]> = { 
  pending:      ['under_review', 'cancelled'], 
  under_review: ['approved', 'cancelled'], 
  approved:     ['assigned', 'cancelled'], 
  assigned:     ['in_progress', 'cancelled'], 
  in_progress:  ['completed'], 
  completed:    [], 
  cancelled:    [], 
};

export const CLERK_ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['under_review', 'cancelled'],
  under_review: ['approved', 'rejected', 'cancelled'],
};

export const CLERK_NOTES_REQUIRED: string[] = ['rejected', 'cancelled'];

// ─── Supervisor / Assignment transitions ───────────────────────────────────
export const SUPERVISOR_ALLOWED_TRANSITIONS: Record<string, string[]> = {
   approved: ['assigned', 'cancelled'],
   assigned: ['in_progress', 'cancelled'],
   in_progress: ['completed', 'cancelled'],
 };

 export const SUPERVISOR_NOTES_REQUIRED: string[] = ['cancelled'];

// ─── Technician transitions ────────────────────────────────────────────────
export const TECHNICIAN_ALLOWED_TRANSITIONS: Record<string, string[]> = {
   assigned: ['in_progress'],
   in_progress: ['completed'],
 };

export const TECHNICIAN_NOTES_REQUIRED: string[] = [];