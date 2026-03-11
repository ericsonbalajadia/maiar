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