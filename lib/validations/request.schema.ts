// lib/validations/request.schema.ts
import { z } from 'zod';
import { PPSR_SERVICE_TYPES } from '@/lib/constants/ppsr-service-types';

export const createRmrSchema = z.object({
  request_type: z.literal('rmr'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location_id: z.string().uuid('Please select a valid location'),
  priority_id: z.string().uuid('Please select a priority level'),
  category_id: z.string().uuid('Please select a nature of work'),
});

export const createPpsrSchema = z.object({
  request_type: z.literal('ppsr'),
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  location_id: z.string().uuid('Please select a valid location'),
  priority_id: z.string().uuid('Please select a priority level'),
   service_type: z.enum(PPSR_SERVICE_TYPES, {
    error: () => ({ message: 'Please select a service type' }),
  }),
  service_data: z.record(z.string(), z.unknown()).optional(),
});

// Union schema – used by the Server Action
export const createRequestSchema = z.discriminatedUnion('request_type', [
  createRmrSchema,
  createPpsrSchema,
]);

export type CreateRmrInput = z.infer<typeof createRmrSchema>;
export type CreatePpsrInput = z.infer<typeof createPpsrSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;