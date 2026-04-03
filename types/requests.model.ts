// types/requests.model.ts
// Manual type definitions for tables not yet in generated database.types.ts
// These mirror the actual Supabase schema exactly.

import type { Json } from './database.types'

// ─── Lookup Tables ────────────────────────────────────────────────────────────

export type Category = {
  id: string
  category_name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Location = {
  id: string
  building_name: string
  floor_level: string | null
  room_number: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Status = {
  id: string
  status_name: string
  description: string | null
  is_active: boolean
  is_terminal: boolean
  created_at: string
  updated_at: string
}

export type Priority = {
  id: string
  level: string
  description: string | null
  response_time_hours: number
  created_at: string
  updated_at: string
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export type RequestType = 'rmr' | 'ppsr'

export type Request = {
  id: string
  ticket_number: string
  title: string
  description: string | null
  request_type: string
  status_id: string | null
  category_id: string | null
  location_id: string | null
  priority_id: string | null
  requester_id: string | null
  assigned_technician_id: string | null
  estimated_completion_date: string | null
  actual_completion_date: string | null
  created_at: string
  updated_at: string
}

export type InsertRequest = {
  title: string
  description?: string | null
  request_type: string
  status_id?: string | null
  category_id?: string | null
  location_id?: string | null
  priority_id?: string | null
  requester_id?: string | null
}

// Request joined with related lookup data — used in list views
export type RequestWithRelations = Request & {
  statuses: Pick<Status, 'status_name'> | null
  categories: Pick<Category, 'category_name'> | null
  locations: Pick<Location, 'building_name' | 'floor_level' | 'room_number'> | null
  priorities: Pick<Priority, 'level'> | null
  users: { full_name: string; email: string; department: string | null } | null
}

// ─── RMR Details ──────────────────────────────────────────────────────────────

export type RmrDetails = {
  id: string
  request_id: string
  inspected_by: string | null
  inspection_confirmed_by: string | null
  inspection_date: string | null
  inspection_time_start: string | null
  inspection_time_end: string | null
  inspector_notes: string | null
  repair_mode: string | null
  materials_available: boolean | null
  manpower_required: number | null
  estimated_duration: string | null
  schedule_notes: string | null
  created_at: string
  updated_at: string
}

export type InsertRmrDetails = {
  request_id: string
}

// ─── PPSR Details ─────────────────────────────────────────────────────────────

export type PpsrServiceType =
  | 'audio_system'
  | 'land_preparation'
  | 'site_development'
  | 'hauling'
  | 'plans_layouts_estimates'
  | 'tent_installation'
  | 'fabrication'
  | 'installation'
  | 'machining_works'
  | 'landscaping'
  | 'others'

export type AudioSoundSystemData = {
  with_lights: boolean
  setup_location: string
  date_time_needed: string
  estimated_duration_hrs: number
}

export type LandPreparationData = {
  location_area_covered: string
  estimated_passing_trip: string
}

export type SiteDevelopmentData = {
  location: string
}

export type HaulingData = {
  from: string
  to: string
}

export type TentInstallationData = {
  setup_location: string
  number_of_tents: number
  tent_size: string
}

export type LandscapingData = {
  location_area_covered: string
}

export type OthersData = {
  specify: string
}

export type DescriptionOnlyData = Record<string, never>

export type PpsrServiceData =
  | AudioSoundSystemData
  | LandPreparationData
  | SiteDevelopmentData
  | HaulingData
  | TentInstallationData
  | LandscapingData
  | OthersData
  | DescriptionOnlyData

export type PpsrDetails = {
  id: string
  request_id: string
  service_type: PpsrServiceType
  service_data: Json
  created_at: string
  updated_at: string
}

export type InsertPpsrDetails = {
  request_id: string
  service_type: PpsrServiceType
  service_data: Json
}

// ─── Attachments ──────────────────────────────────────────────────────────────

export type Attachment = {
  id: string
  request_id: string | null
  feedback_id: string | null
  uploaded_by: string
  file_path: string
  file_name: string
  mime_type: string
  file_size: number
  created_at: string
  updated_at: string
}

// ─── Status History ───────────────────────────────────────────────────────────

export type StatusHistory = {
  id: string
  request_id: string
  old_status_id: string | null
  new_status_id: string
  changed_by: string | null
  changed_at: string
  change_reason: string | null
  metadata: Json | null
  created_at: string
  updated_at: string
  // joined:
  statuses?: Pick<Status, 'status_name'> | null
}

// ─── Feedbacks ────────────────────────────────────────────────────────────────

export type Feedback = {
  id: string
  request_id: string
  requester_id: string
  overall_rating: number
  service_satisfaction: number
  comments: string | null
  is_anonymous: boolean
  submitted_at: string | null
  created_at: string
  updated_at: string
}

// ─── Accomplishments ──────────────────────────────────────────────────────────

export type Accomplishment = {
  id: string
  request_id: string
  conducted_by: string | null
  verified_by: string | null
  verified_at: string | null
  started_at: string | null
  finished_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Request Reviews ──────────────────────────────────────────────────────────

export type RequestReview = {
  id: string
  request_id: string
  reviewer_id: string
  decision: string
  review_notes: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

// ─── Request Assignments ──────────────────────────────────────────────────────

export type RequestAssignment = {
  id: string
  request_id: string
  assigned_user_id: string
  assigned_by: string
  assigned_at: string
  acceptance_status: string | null
  is_current_assignment: boolean
  completed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Full Request Detail (for detail page) ────────────────────────────────────

export type RequestDetail = RequestWithRelations & {
  rmr_details: RmrDetails | null
  ppsr_details: PpsrDetails | null
  attachments: Attachment[]
  status_history: StatusHistory[]
}

// ─── Form Input Types ─────────────────────────────────────────────────────────

export type RmrFormInput = {
  title: string
  description: string
  location_building: string
  location_floor?: string
  location_room?: string
  designation: string
  contact_email: string
  category_id: string
  others_specify?: string
}
 
export type PpsrFormInput = {
  title: string
  description: string
  location_building: string
  location_floor?: string
  location_room?: string
  designation: string
  contact_email: string
  service_type: PpsrServiceType
  service_data: Record<string, string>
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export type RequesterStats = {
  total: number
  pending: number
  inProgress: number
  completed: number
  awaitingFeedback: number
}

export type AdminStats = {
  totalRequests: number
  requestsThisMonth: number
  pendingReview: number
  completedThisMonth: number
  activeUsers: number
  pendingApprovals: number
}