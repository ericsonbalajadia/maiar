// lib/validations/assignment.schema.ts
import { z } from 'zod';

export const assignmentSchema = z.object({
  request_id: z.string().uuid('Invalid request ID'),
  assigned_user_id: z.string().uuid('Please select a technician'),
  notes: z.string().max(500).optional(),
});

// Used by the technician acceptance flow
export const acceptanceSchema = z.object({
  assignment_id: z.string().uuid('Invalid assignment ID'),
  acceptance_status: z.enum(['accepted', 'rejected'], {
    error: () => ({ message: 'Invalid acceptance status' }),
  }),
  notes: z.string().max(500).optional(),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type AcceptanceInput = z.infer<typeof acceptanceSchema>;
