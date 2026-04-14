export const REQUEST_TYPES = {
  RMR: 'rmr',      // FM-GSO-09
  PPSR: 'ppsr',    // FM-GSO-15
} as const;

export type RequestType = typeof REQUEST_TYPES[keyof typeof REQUEST_TYPES];

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  rmr: 'FM-GSO-09 - Repair & Maintenance Request',
  ppsr: 'FM-GSO-15 - Physical Plant Service Request',
};