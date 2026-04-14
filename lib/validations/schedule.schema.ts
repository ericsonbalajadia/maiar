import { z } from 'zod';

export const UpdateScheduleSchema = z.object({
  assignmentId: z.string().uuid('Invalid assignment ID'),
  scheduledStart: z.string().min(1, 'Start date/time is required'),
  scheduledEnd: z.string().min(1, 'End date/time is required'),
  scheduleNotes: z.string().max(500).optional(),
}).superRefine((data, ctx) => {
  // Convert local datetime strings to ISO strings for comparison
  const start = new Date(data.scheduledStart);
  const end = new Date(data.scheduledEnd);
  
  if (isNaN(start.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['scheduledStart'],
      message: 'Invalid start date/time',
    });
  }
  if (isNaN(end.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['scheduledEnd'],
      message: 'Invalid end date/time',
    });
  }
  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['scheduledEnd'],
      message: 'End time must be after start time',
    });
  }
});

export type UpdateScheduleInput = z.infer<typeof UpdateScheduleSchema>;