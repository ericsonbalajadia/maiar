// lib/validations/accomplishment.schema.ts
import { z } from 'zod';

// Used when a technician/supervisor records work details
//Show an "Update Progress" button.
export const saveAccomplishmentSchema = z.object({
  request_id: z.string().uuid('Invalid request ID'),
  started_at: z.string().datetime({ message: 'Enter a valid start date and time' }).optional(),
  finished_at: z.string().datetime({ message: 'Enter a valid finish date and time' }).optional(),
  notes: z.string().max(2000).optional(),
}).refine(data => {
  if (data.started_at && data.finished_at) {
    return new Date(data.finished_at) >= new Date(data.started_at);
  }
  return true;
}, {
  message: 'Finish time cannot be before start time',
  path: ['finished_at']
});

// Separate schema for the GenSO Head verification step.
//Show a "Verify & Close" button.
export const verifyAccomplishmentSchema = z.object({
  accomplishment_id: z.string().uuid('Invalid accomplishment ID'),
  request_id: z.string().uuid('Invalid request ID'),
  // finished_at is required before verification is allowed
  finished_at: z.string().datetime({ message: 'Work finish time must be set before verifying' }),
  notes: z.string().max(2000).optional(),
});

export const reviewAccomplishmentSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('approve'),
    accomplishment_id: z.string().uuid(),
    notes: z.string().max(2000).optional(),
  }),
  z.object({
    action: z.literal('reject'),
    accomplishment_id: z.string().uuid(),
    rejection_reason: z.string().min(10, 'Please provide a reason for rejection (min 10 chars)'),
  }),
]);

// Export the Type so your Form knows what the data looks like
export type ReviewAccomplishmentInput = z.infer<typeof reviewAccomplishmentSchema>;

export type SaveAccomplishmentInput = z.infer<typeof saveAccomplishmentSchema>;
export type VerifyAccomplishmentInput = z.infer<typeof verifyAccomplishmentSchema>;