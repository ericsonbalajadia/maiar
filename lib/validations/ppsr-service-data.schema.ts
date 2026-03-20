// lib/validations/ppsr-service-data.schema.ts
import { z } from 'zod';

// Individual schemas for each PPSR service type
const audioSystemSchema = z.object({
  with_lights: z.boolean(),
  setup_location: z.string().min(1, 'Setup location is required'),
  date_time_needed: z.string().datetime('Please enter a valid date and time'),
  estimated_duration_hrs: z.number().positive(),
});

const landPreparationSchema = z.object({
  location_area: z.string().min(1, 'Location area is required'),
  estimated_passing_trips: z.number().int().positive(),
});

const siteDevelopmentSchema = z.object({
  location: z.string().min(1, 'Location is required'),
});

const haulingSchema = z.object({
  from_location: z.string().min(1, 'Origin location is required'),
  to_location: z.string().min(1, 'Destination location is required'),
});

const tentInstallationSchema = z.object({
  setup_location: z.string().min(1, 'Setup location is required'),
  number_of_tents: z.number().int().positive(),
  tent_size: z.string().min(1, 'Tent size is required'),
});

const fabricationSchema = z.object({
  description_of_work: z.string().min(10, 'Description must be at least 10 characters'),
});

const installationSchema = z.object({
  description_of_installation: z.string().min(10, 'Description must be at least 10 characters'),
});

const machiningWorksSchema = z.object({
  machine_type: z.string().min(2, 'Machine type is required'),
});

const landscapingSchema = z.object({
  location_area: z.string().min(2, 'Location area is required'),
});

const plansLayoutsEstimatesSchema = z.object({
  plan_type: z.string().min(5, 'Plan type is required'),
});

const othersSchema = z.object({
  specify: z.string().min(5, 'Please describe the service required'),
});

// Discriminated union keyed on service_type
export const ppsrServiceDataSchema = z.discriminatedUnion('service_type', [
  z.object({ service_type: z.literal('audio_system'), ...audioSystemSchema.shape }),
  z.object({ service_type: z.literal('land_preparation'), ...landPreparationSchema.shape }),
  z.object({ service_type: z.literal('site_development'), ...siteDevelopmentSchema.shape }),
  z.object({ service_type: z.literal('hauling'), ...haulingSchema.shape }),
  z.object({ service_type: z.literal('tent_installation'), ...tentInstallationSchema.shape }),
  z.object({ service_type: z.literal('fabrication'), ...fabricationSchema.shape }),
  z.object({ service_type: z.literal('installation'), ...installationSchema.shape }),
  z.object({ service_type: z.literal('machining_works'), ...machiningWorksSchema.shape }),
  z.object({ service_type: z.literal('landscaping'), ...landscapingSchema.shape }),
  z.object({ service_type: z.literal('plans_layouts_estimates'), ...plansLayoutsEstimatesSchema.shape }),
  z.object({ service_type: z.literal('others'), ...othersSchema.shape }),
]);

export type PpsrServiceData = z.infer<typeof ppsrServiceDataSchema>;