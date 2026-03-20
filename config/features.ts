// config/features.ts
export const FEATURES = {
  /**
   * RMR Inspection Module (FM-GSO-09 Inspection Section)
   * Schema: rmr_details table (Migration 007)
   * Status: DEFERRED - set to true when re-prioritized
   */
  RMR_INSPECTION_ENABLED: false,

  
  PPSR_FORM_ENABLED: true,
  ATTACHMENTS_ENABLED: true,
  FEEDBACK_ENABLED: true,
  NOTIFICATIONS_ENABLED: true,
  REALTIME_ENABLED: true,
  
  // Individual real-time feature flags
  REALTIME_REQUEST_STATUS: true,
  REALTIME_NOTIFICATIONS: true,
} as const;