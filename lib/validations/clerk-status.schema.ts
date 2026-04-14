// lib/validations/clerk-status.schema.ts
import { z } from 'zod';

export const ClerkStatusUpdateSchema = z.object({
  requestId: z.string().uuid({ message: 'Invalid request ID' }),
  newStatus: z.enum(['under_review', 'approved', 'rejected', 'cancelled']),
  notes: z.string().max(1000).optional(),
}).superRefine((data, ctx) => {
  if (['rejected', 'cancelled'].includes(data.newStatus) && !data.notes?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A reason / notes is required when rejecting or cancelling.',
      path: ['notes'],
    });
  }
});

export type ClerkStatusUpdateInput = z.infer<typeof ClerkStatusUpdateSchema>;