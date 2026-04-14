export const PPSR_SERVICE_TYPES = [
  'audio_system',
  'land_preparation',
  'site_development',
  'hauling',
  'tent_installation',
  'fabrication',
  'installation',
  'machining_works',
  'landscaping',
  'plans_layouts_estimates',
  'others',
] as const;

export type PpsrServiceType = typeof PPSR_SERVICE_TYPES[number];

// Human-readable labels for the form select
export const PPSR_SERVICE_LABELS: Record<PpsrServiceType, string> = {
  audio_system: 'Audio System',
  land_preparation: 'Land Preparation',
  site_development: 'Site Development',
  hauling: 'Hauling',
  tent_installation: 'Tent Installation',
  fabrication: 'Fabrication',
  installation: 'Installation',
  machining_works: 'Machining Works',
  landscaping: 'Landscaping',
  plans_layouts_estimates: 'Plans, Layouts & Estimates',
  others: 'Others (Specify)',
};

// JSONB field definitions per service type
// Source: Migration 008 comment block – used by validation schemas and dynamic forms
export const PPSR_SERVICE_FIELDS: Record<PpsrServiceType, string[]> = {
  audio_system: ['with_lights', 'setup_location', 'date_time_needed', 'estimated_duration_hrs'],
  land_preparation: ['location_area', 'estimated_passing_trips'],
  site_development: ['location'],
  hauling: ['from_location', 'to_location'],
  tent_installation: ['setup_location', 'number_of_tents', 'tent_size'],
  fabrication: ['description_of_work'],
  installation: ['description_of_installation'],
  machining_works: ['machine_type'],
  landscaping: ['location_area'],
  plans_layouts_estimates: ['plan_type'],
  others: ['specify'],
};

// Required fields per service type – used for validation
export const PPSR_REQUIRED_FIELDS: Partial<Record<PpsrServiceType, string[]>> = {
  audio_system: ['setup_location', 'date_time_needed'],
  hauling: ['from_location', 'to_location'],
  tent_installation: ['setup_location', 'number_of_tents'],
  others: ['specify'],
  // All others have no required fields or are optional
};