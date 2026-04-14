import { z } from 'zod';
import { SUPERVISOR_NOTES_REQUIRED } from '@/lib/constants/statuses';

export const SupervisorStatusUpdateSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  newStatus: z.string().min(1, 'Status is required'),
  notes: z.string().max(500).optional(),
}).superRefine((data, ctx) => {
  if (SUPERVISOR_NOTES_REQUIRED.includes(data.newStatus) && !data.notes?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['notes'],
      message: `Notes are required when setting status to ${data.newStatus}`,
    });
  }
});

export type SupervisorStatusUpdateInput = z.infer<typeof SupervisorStatusUpdateSchema>;