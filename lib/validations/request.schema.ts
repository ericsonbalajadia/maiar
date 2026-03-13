// lib/validation/request.schema.ts
import { z } from 'zod'
import {
  PPSR_SERVICE_TYPES,
  PPSR_SERVICE_FIELDS,
  type PpsrServiceType,
} from '@/lib/constants/ppsr-service-types'
import { REQUEST_TYPES } from '@/lib/constants/request-types'

// ─── RMR Schema ───────────────────────────────────────────────────────────────

export const rmrSchema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category_id: z.string().uuid('Invalid category'),
  location_id: z.string().uuid('Invalid location'),
})

export type RmrFormValues = z.infer<typeof rmrSchema>

// ─── PPSR Schema ──────────────────────────────────────────────────────────────

// service_data is validated loosely here; deep validation happens per service type
export const ppsrBaseSchema = z.object({
  title:        z.string().min(3, 'Title must be at least 3 characters'),
  description:  z.string().optional(),
  location_id:  z.string().uuid('Invalid location'),
  service_type: z.enum(PPSR_SERVICE_TYPES, { message: 'Service type is required' }),
  service_data: z.record(z.string(), z.unknown()).default({}),
})

export type PpsrFormValues = z.infer<typeof ppsrBaseSchema>
export type PpsrServiceTypeValue = PpsrServiceType

// ─── Per-service-type field schemas ──────────────────────────────────────────
// Auto-generated from PPSR_SERVICE_FIELDS — each field is an optional string.
// Specific fields can be tightened below as needed.

function makeServiceSchema(serviceType: PpsrServiceType) {
  const fields = PPSR_SERVICE_FIELDS[serviceType]

  // Required fields per service type — declared up-front to avoid type mutation issues
  const requiredFields: Partial<Record<PpsrServiceType, string[]>> = {
    audio_system:      ['setup_location', 'date_time_needed'],
    hauling:           ['from_location', 'to_location'],
    tent_installation: ['setup_location', 'number_of_tents'],
    others:            ['specify'],
  }
  const requiredSet = new Set(requiredFields[serviceType] ?? [])

  // Build two typed shapes separately — merging avoids ZodOptional vs ZodString mismatch
  const optionalShape: Record<string, z.ZodOptional<z.ZodString>> = {}
  const requiredShape: Record<string, z.ZodString> = {}

  fields.forEach((field) => {
    if (requiredSet.has(field)) {
      requiredShape[field] = z.string().min(1, field.replace(/_/g, ' ') + ' is required')
    } else {
      optionalShape[field] = z.string().optional()
    }
  })

  return z.object({ ...optionalShape, ...requiredShape })
}

// Map of all per-service schemas
export const PPSR_SERVICE_SCHEMAS = Object.fromEntries(
  PPSR_SERVICE_TYPES.map((type) => [type, makeServiceSchema(type)])
) as Record<PpsrServiceType, ReturnType<typeof makeServiceSchema>>

// ─── Validate service_data for a given service type ───────────────────────────

export function validateServiceData(
  serviceType: PpsrServiceType,
  data: Record<string, unknown>
): { success: true } | { success: false; errors: Record<string, string> } {
  const schema = PPSR_SERVICE_SCHEMAS[serviceType]
  if (!schema) return { success: true } // Unknown type — skip deep validation

  const result = schema.safeParse(data)
  if (result.success) return { success: true }

  const errors: Record<string, string> = {}
  result.error.issues.forEach((issue) => {
    const key = issue.path[0]?.toString() ?? 'form'
    errors[key] = issue.message
  })
  return { success: false, errors }
}

// ─── Re-exports for convenience ───────────────────────────────────────────────

export { PPSR_SERVICE_TYPES, PPSR_SERVICE_FIELDS }
export type { PpsrServiceType }