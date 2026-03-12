export const REQUEST_TYPES = {
  RMR: 'rmr',      // FM-GSO-09
  PPSR: 'ppsr',    // FM-GSO-15
} as const;

export type RequestType = typeof REQUEST_TYPES[keyof typeof REQUEST_TYPES];