// lib/validations/review.schema.ts
import { z } from 'zod';

export const reviewSchema = z.object({
  request_id: z.string().uuid('Invalid request ID'),
  decision: z.enum(['approved', 'rejected', 'needs_info'], {
    error: () => ({ message: 'Please select a review decision' }),
  }),
  review_notes: z.string().max(2000).optional(),
}).superRefine((data, ctx) => {
  if (['rejected', 'needs_info'].includes(data.decision)) {
    if (!data.review_notes || data.review_notes.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['review_notes'],
        message: 'Review notes are required when rejecting or requesting more info',
      });
    }
  }
});

export type ReviewInput = z.infer<typeof reviewSchema>;