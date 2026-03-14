// lib/validation/request.schema.ts (merged)
import { z } from 'zod';
import {
  PPSR_SERVICE_TYPES,
  PPSR_SERVICE_FIELDS,
  type PpsrServiceType,
} from '@/lib/constants/ppsr-service-types';

// ─── RMR Schema (your version) ───────────────────────────────────────────────
export const createRmrSchema = z.object({
  request_type: z.literal('rmr'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location_id: z.string().uuid('Please select a valid location'),
  priority_id: z.string().uuid('Please select a priority level'),
  category_id: z.string().uuid('Please select a nature of work'),
});

// ─── PPSR Schema (your version, extended with service_data) ──────────────────
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

// ─── Discriminated union for server actions (your version) ───────────────────
export const createRequestSchema = z.discriminatedUnion('request_type', [
  createRmrSchema,
  createPpsrSchema,
]);

export type CreateRmrInput = z.infer<typeof createRmrSchema>;
export type CreatePpsrInput = z.infer<typeof createPpsrSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;

// ─────────────────────────────────────────────────────────────────────────────
//  Per‑service validation (from develop) – useful for deep checking service_data
// ─────────────────────────────────────────────────────────────────────────────

// Base PPSR schema for forms (without request_type)
export const ppsrBaseSchema = z.object({
  title:        z.string().min(3, 'Title must be at least 3 characters'),
  description:  z.string().optional(),
  location_id:  z.string().uuid('Invalid location'),
  service_type: z.enum(PPSR_SERVICE_TYPES, { message: 'Service type is required' }),
  service_data: z.record(z.string(), z.unknown()).default({}),
});

export type PpsrFormValues = z.infer<typeof ppsrBaseSchema>;

// Helper to generate per‑service schemas
function makeServiceSchema(serviceType: PpsrServiceType) {
  const fields = PPSR_SERVICE_FIELDS[serviceType];

  const requiredFields: Partial<Record<PpsrServiceType, string[]>> = {
    audio_system:      ['setup_location', 'date_time_needed'],
    hauling:           ['from_location', 'to_location'],
    tent_installation: ['setup_location', 'number_of_tents'],
    others:            ['specify'],
  };
  const requiredSet = new Set(requiredFields[serviceType] ?? []);

  const optionalShape: Record<string, z.ZodOptional<z.ZodString>> = {};
  const requiredShape: Record<string, z.ZodString> = {};

  fields.forEach((field) => {
    if (requiredSet.has(field)) {
      requiredShape[field] = z.string().min(1, field.replace(/_/g, ' ') + ' is required');
    } else {
      optionalShape[field] = z.string().optional();
    }
  });

  return z.object({ ...optionalShape, ...requiredShape });
}

export const PPSR_SERVICE_SCHEMAS = Object.fromEntries(
  PPSR_SERVICE_TYPES.map((type) => [type, makeServiceSchema(type)])
) as Record<PpsrServiceType, ReturnType<typeof makeServiceSchema>>;

export function validateServiceData(
  serviceType: PpsrServiceType,
  data: Record<string, unknown>
): { success: true } | { success: false; errors: Record<string, string> } {
  const schema = PPSR_SERVICE_SCHEMAS[serviceType];
  if (!schema) return { success: true };

  const result = schema.safeParse(data);
  if (result.success) return { success: true };

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const key = issue.path[0]?.toString() ?? 'form';
    errors[key] = issue.message;
  });
  return { success: false, errors };
}

// Re‑export constants for convenience
export { PPSR_SERVICE_TYPES, PPSR_SERVICE_FIELDS };
export type { PpsrServiceType };