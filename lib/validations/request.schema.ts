// lib/validations/request.schema.ts
import { z } from 'zod'
import {
  PPSR_SERVICE_TYPES,
  PPSR_SERVICE_FIELDS,
  type PpsrServiceType,
} from '@/lib/constants/ppsr-service-types'
import { REQUEST_TYPES } from '@/lib/constants/request-types'

// ─── Required fields per service type ───────────────────────────
const REQUIRED_PPSR_FIELDS: Partial<Record<PpsrServiceType, string[]>> = {
  audio_system:      ['setup_location', 'date_time_needed'],
  hauling:           ['from_location', 'to_location'],
  tent_installation: ['setup_location', 'number_of_tents'],
  others:            ['specify'],
}

// ─── Helper: build Zod schema for a given service type ──────────
function buildServiceSchema(serviceType: PpsrServiceType) {
  const fields = PPSR_SERVICE_FIELDS[serviceType]
  const required = new Set(REQUIRED_PPSR_FIELDS[serviceType] ?? [])

  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    // Determine field type based on naming conventions
    let fieldSchema: z.ZodTypeAny
    if (field === 'with_lights') {
      fieldSchema = z.boolean()
    } else if (field.includes('date') || field === 'date_time_needed') {
      fieldSchema = z.string().datetime({ message: 'Invalid date/time format' })
    } else if (
      field.includes('duration') ||
      field.includes('trips') ||
      field.includes('tents') ||
      field === 'estimated_passing_trips' ||
      field === 'number_of_tents' ||
      field === 'estimated_duration_hrs'
    ) {
      fieldSchema = z.number().positive()
    } else {
      // Default to string
      fieldSchema = z.string()
    }

    // Apply required/optional
    if (required.has(field)) {
      if (fieldSchema instanceof z.ZodString) {
        shape[field] = fieldSchema.min(1, `${field.replace(/_/g, ' ')} is required`)
      } else {
        shape[field] = fieldSchema
      }
    } else {
      shape[field] = fieldSchema.optional()
    }
  }

  return z.object(shape)
}

// ─── Build discriminated union for PPSR service data ────────────
const ppsrUnionOptions = PPSR_SERVICE_TYPES.map((type) =>
  z.object({
    service_type: z.literal(type),
    service_data: buildServiceSchema(type),
  })
)

// Cast to the expected tuple type – safe because PPSR_SERVICE_TYPES is non‑empty.
export const ppsrServiceDataSchema = z.discriminatedUnion(
  'service_type',
  ppsrUnionOptions as [z.ZodObject<any>, ...z.ZodObject<any>[]]
)
export type PpsrServiceData = z.infer<typeof ppsrServiceDataSchema>

// ─── RMR schema (FM-GSO-09) ─────────────────────────────────────
export const rmrSchema = z.object({
  request_type: z.literal('rmr'),
  title:        z.string().min(3, 'Title must be at least 3 characters'),
  description:  z.string().optional(),
  location_id:  z.string().uuid('Invalid location'),
  category_id:  z.string().uuid('Invalid category'),
})

export type RmrFormValues = z.infer<typeof rmrSchema>

// ─── PPSR base schema (without service_data) ───────────────────
export const ppsrBaseSchema = z.object({
  request_type: z.literal('ppsr'),
  title:        z.string().min(3, 'Title must be at least 3 characters'),
  description:  z.string().optional(),
  location_id:  z.string().uuid('Invalid location'),
  service_type: z.enum(PPSR_SERVICE_TYPES, { message: 'Service type is required' }),
})

export type PpsrBaseValues = z.infer<typeof ppsrBaseSchema>

// ─── Combined request schema (used by the form) ─────────────────
export const requestSchema = z.discriminatedUnion('request_type', [
  rmrSchema,
  ppsrBaseSchema,
])

export type RequestFormValues = z.infer<typeof requestSchema>

// ─── Re-exports for convenience ─────────────────────────────────
export { PPSR_SERVICE_TYPES, PPSR_SERVICE_FIELDS }
export type { PpsrServiceType }