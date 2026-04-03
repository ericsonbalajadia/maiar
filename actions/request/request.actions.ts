'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type {
  RmrFormInput,
  PpsrFormInput,
  RequestWithRelations,
  RequestDetail,
  RequesterStats,
  AdminStats,
} from '@/types/requests.model'
import type { Json } from '@/types/database.types'
import type { PpsrServiceType } from '@/lib/validations/request.schema'

// ─── Types ────────────────────────────────────────────────────────────────────

export type RequestActionState = {
  error?: string
  success?: boolean
  ticketNumber?: string | null
  requestId?: string
  title?: string
  requestType?: string
}

export type PaginatedRequests = {
  data: RequestWithRelations[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export type RequestFilters = {
  status?: string
  request_type?: string
  date_from?: string
  date_to?: string
  page?: number
  pageSize?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fetch the pending status id once */
async function getPendingStatusId(): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('statuses')
    .select('id')
    .eq('status_name', 'pending')
    .eq('is_active', true)
    .single()
  return data?.id ?? null
}

/** Get the current logged-in user's users.id (not auth_id) */
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()
  return data?.id ?? null
}

/**
 * Looks up a location by building_name + floor_level + room_number (case-insensitive).
 * If a match exists, returns its ID.
 * Otherwise inserts a new active location row and returns the new ID.
 * Uses the admin client because requesters lack INSERT permission on locations.
 */
async function resolveOrCreateLocation(
  buildingName: string,
  floorLevel: string,
  roomNumber: string,
): Promise<string | null> {
  const admin = createAdminClient()

  const building = buildingName.trim()
  const floor    = floorLevel.trim()
  const room     = roomNumber.trim()

  // Look for an existing match across all three fields
  let query = admin
    .from('locations')
    .select('id')
    .ilike('building_name', building)

  if (floor) {
    query = query.ilike('floor_level', floor)
  } else {
    query = query.is('floor_level', null)
  }

  if (room) {
    query = query.ilike('room_number', room)
  } else {
    query = query.is('room_number', null)
  }

  const { data: existing } = await query.maybeSingle()
  if (existing) return existing.id

  // No match — create a new location
  const { data: inserted, error } = await admin
    .from('locations')
    .insert({
      building_name: building,
      floor_level:   floor || null,
      room_number:   room  || null,
      is_active:     true,
    })
    .select('id')
    .single()

  if (error || !inserted) {
    console.error('resolveOrCreateLocation insert error:', error)
    return null
  }

  return inserted.id
}

// ─── createRequest ────────────────────────────────────────────────────────────

/**
 * Inserts a new request into `requests`, then inserts the type-specific
 * detail row into either `rmr_details` or `ppsr_details`.
 * Returns the new ticket_number on success.
 */
export async function createRequest(
  type: 'rmr',
  input: RmrFormInput
): Promise<RequestActionState>
export async function createRequest(
  type: 'ppsr',
  input: PpsrFormInput
): Promise<RequestActionState>
export async function createRequest(
  type: 'rmr' | 'ppsr',
  input: RmrFormInput | PpsrFormInput
): Promise<RequestActionState> {
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to submit a request.' }

  // 2. Get users.id for requester_id
  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()
  if (!dbUser) return { error: 'User record not found. Please contact support.' }

  // 3. Resolve pending status id
  const pendingStatusId = await getPendingStatusId()
  if (!pendingStatusId) return { error: 'System configuration error: pending status not found.' }

  // 4. Insert into requests
  const requestInsertPayload = {
  title: input.title,
  description: input.description,
  request_type: type,
  location_id: input.location_id,
  category_id: type === 'rmr' ? (input as RmrFormInput).category_id : null,
  status_id: pendingStatusId,
  requester_id: dbUser.id,
}

  const { data: newRequest, error: requestError } = await supabase
    .from('requests')
    .insert(requestInsertPayload as any)
    .select('id, ticket_number, title, request_type')
    .single()

  if (requestError || !newRequest) {
    console.error('createRequest insert error:', requestError)
    return { error: requestError?.message ?? 'Failed to submit request. Please try again.' }
  }

  // 6. Insert into detail table
  if (type === 'rmr') {
    const { error: detailError } = await supabase
      .from('rmr_details')
      .insert({ request_id: newRequest.id })

    if (detailError) {
      console.error('rmr_details insert error:', detailError)
      return {
        error:
          'Request submitted but detail record failed. Contact support with ticket: ' +
          newRequest.ticket_number,
      }
    }
  } else {
    const ppsrInput = input as PpsrFormInput
    const { error: detailError } = await supabase
      .from('ppsr_details')
      .insert({
        request_id:   newRequest.id,
        service_type: ppsrInput.service_type as PpsrServiceType,
        service_data: ppsrInput.service_data,
      })

    if (detailError) {
      console.error('ppsr_details insert error:', detailError)
      return {
        error:
          'Request submitted but detail record failed. Contact support with ticket: ' +
          newRequest.ticket_number,
      }
    }
  }

  revalidatePath('/requester/requests')
  revalidatePath('/requester')

  return {
    success:     true,
    ticketNumber: newRequest.ticket_number,
    requestId:   newRequest.id,
    title:       newRequest.title,
    requestType: newRequest.request_type,
  }
}

// ─── getRequesterRequests ─────────────────────────────────────────────────────

/**
 * Fetches paginated requests for the currently logged-in requester.
 * Applies optional filters for status, type, and date range.
 */
export async function getRequesterRequests(
  filters: RequestFilters = {}
): Promise<PaginatedRequests> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const empty: PaginatedRequests = { data: [], count: 0, page: 1, pageSize: 10, totalPages: 0 }
  if (!user) return empty

  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()
  if (!dbUser) return empty

  const page     = filters.page     ?? 1
  const pageSize = filters.pageSize ?? 10
  const from     = (page - 1) * pageSize
  const to       = from + pageSize - 1

  let query = supabase
    .from('requests')
    .select(
      `
      id, ticket_number, title, description, request_type,
      status_id, category_id, location_id, priority_id, requester_id,
      created_at, updated_at,
      statuses ( status_name ),
      categories ( category_name ),
      locations ( building_name, floor_level, room_number ),
      priorities ( level )
      `,
      { count: 'exact' }
    )
    .eq('requester_id', dbUser.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.status) {
    const { data: statusRow } = await supabase
      .from('statuses')
      .select('id')
      .eq('status_name', filters.status)
      .single()
    if (statusRow) query = query.eq('status_id', statusRow.id)
  }

  if (filters.request_type) {
    query = query.eq('request_type', filters.request_type)
  }

  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from)
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to + 'T23:59:59.999Z')
  }

  const { data, count, error } = await query

  if (error) {
    console.error('getRequesterRequests error:', error)
    return empty
  }

  return {
    data:       (data ?? []) as unknown as RequestWithRelations[],
    count:      count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

// ─── getRecentRequests (for dashboard home — last 5) ─────────────────────────

export async function getRecentRequests(): Promise<RequestWithRelations[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const admin = createAdminClient()

  const { data: dbUser } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()
  if (!dbUser) return []

  const { data, error } = await admin
    .from('requests')
    .select(
      `
      id, ticket_number, title, description, request_type,
      status_id, category_id, location_id, priority_id, requester_id,
      created_at, updated_at,
      statuses ( status_name ),
      categories ( category_name ),
      locations ( building_name, floor_level, room_number ),
      priorities ( level )
      `
    )
    .eq('requester_id', dbUser.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('getRecentRequests error:', error)
    return []
  }

  return (data ?? []) as unknown as RequestWithRelations[]
}

// ─── getRequesterStats ────────────────────────────────────────────────────────

export async function getRequesterStats(): Promise<RequesterStats> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const empty: RequesterStats = {
    total: 0, pending: 0, inProgress: 0, completed: 0, awaitingFeedback: 0,
  }
  if (!user) return empty

  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()
  if (!dbUser) return empty

  const { data: statuses } = await supabase
    .from('statuses')
    .select('id, status_name')
    .eq('is_active', true)

  const statusMap = Object.fromEntries(
    (statuses ?? []).map((s) => [s.status_name.toLowerCase(), s.id])
  )

  const { data: requests, error } = await supabase
    .from('requests')
    .select('id, status_id, created_at')
    .eq('requester_id', dbUser.id)

  if (error || !requests) return empty

  const total       = requests.length
  const pending     = requests.filter((r) => r.status_id === statusMap['pending']).length
  const inProgress  = requests.filter(
    (r) =>
      r.status_id === statusMap['in progress'] ||
      r.status_id === statusMap['in_progress']  ||
      r.status_id === statusMap['assigned']
  ).length
  const completed   = requests.filter((r) => r.status_id === statusMap['completed']).length
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const awaitingFeedback = requests.filter(
    (r) =>
      r.status_id === statusMap['completed'] &&
      r.created_at >= thirtyDaysAgo
  ).length

  return { total, pending, inProgress, completed, awaitingFeedback }
}

// ─── getRequestById ───────────────────────────────────────────────────────────

/**
 * Fetches a full request detail including related lookup data,
 * detail tables, attachments, and status history.
 * RLS ensures the requester can only see their own requests.
 */
export async function getRequestById(id: string): Promise<RequestDetail | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('requests')
    .select(
      `
      id, ticket_number, title, description, request_type,
      status_id, category_id, location_id, priority_id, requester_id,
      created_at, updated_at,
      statuses ( status_name ),
      categories ( category_name ),
      locations ( building_name, floor_level, room_number ),
      priorities ( level ),
      users ( full_name, email, department ),
      rmr_details (
        id, request_id, inspected_by, inspection_confirmed_by,
        inspection_date, inspection_time_start, inspection_time_end,
        inspector_notes, repair_mode, materials_available,
        manpower_required, estimated_duration, schedule_notes,
        created_at, updated_at
      ),
      ppsr_details ( id, request_id, service_type, service_data, created_at, updated_at ),
      attachments ( id, request_id, feedback_id, uploaded_by, file_path, file_name, mime_type, file_size, created_at, updated_at ),
      status_history (
        id, request_id, old_status_id, new_status_id,
        changed_by, changed_at, change_reason, metadata,
        statuses ( status_name )
      )
      `
    )
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('getRequestById error:', error)
    return null
  }

  return data as unknown as RequestDetail
}

// ─── getAllRequests (Admin) ───────────────────────────────────────────────────

/**
 * Admin-only: fetches all requests across all users with optional filters.
 * Uses the admin client to bypass RLS.
 */
export async function getAllRequests(
  filters: RequestFilters = {}
): Promise<PaginatedRequests> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const empty: PaginatedRequests = { data: [], count: 0, page: 1, pageSize: 10, totalPages: 0 }
  if (!user) return empty

  const { data: caller } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()
  if (caller?.role !== 'admin') return empty

  const admin    = createAdminClient()
  const page     = filters.page     ?? 1
  const pageSize = filters.pageSize ?? 10
  const from     = (page - 1) * pageSize
  const to       = from + pageSize - 1

  let query = admin
    .from('requests')
    .select(
      `
      id, ticket_number, title, description, request_type,
      status_id, category_id, location_id, priority_id, requester_id,
      created_at, updated_at,
      statuses ( status_name ),
      categories ( category_name ),
      locations ( building_name, floor_level, room_number ),
      priorities ( level ),
      users ( full_name, email, department )
      `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.status) {
    const { data: statusRow } = await admin
      .from('statuses')
      .select('id')
      .eq('status_name', filters.status)
      .single()
    if (statusRow) query = query.eq('status_id', statusRow.id)
  }

  if (filters.request_type) {
    query = query.eq('request_type', filters.request_type)
  }

  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from)
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to + 'T23:59:59.999Z')
  }

  const { data, count, error } = await query

  if (error) {
    console.error('getAllRequests error:', error)
    return empty
  }

  return {
    data:       (data ?? []) as unknown as RequestWithRelations[],
    count:      count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

// ─── getAdminStats ────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const empty: AdminStats = {
    totalRequests:     0,
    requestsThisMonth: 0,
    pendingReview:     0,
    completedThisMonth: 0,
    activeUsers:       0,
    pendingApprovals:  0,
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return empty

  const admin = createAdminClient()

  const { data: caller } = await admin
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()
  if (caller?.role !== 'admin') return empty

  const now          = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: statuses } = await admin.from('statuses').select('id, status_name')

  const statusMap = Object.fromEntries(
    (statuses ?? []).map((s) => [s.status_name.toLowerCase(), s.id])
  )

  const { count: totalRequests } = await admin
    .from('requests').select('id', { count: 'exact', head: true })

  const { count: requestsThisMonth } = await admin
    .from('requests').select('id', { count: 'exact', head: true })
    .gte('created_at', startOfMonth)

  const pendingId = statusMap['pending']
  const { count: pendingReview } = pendingId
    ? await admin.from('requests').select('id', { count: 'exact', head: true }).eq('status_id', pendingId)
    : { count: 0 }

  const completedId = statusMap['completed']
  const { count: completedThisMonth } = completedId
    ? await admin.from('requests').select('id', { count: 'exact', head: true })
        .eq('status_id', completedId).gte('created_at', startOfMonth)
    : { count: 0 }

  const { count: activeUsers } = await admin
    .from('users').select('id', { count: 'exact', head: true }).eq('is_active', true)

  const { count: pendingApprovals } = await admin
    .from('users').select('id', { count: 'exact', head: true }).eq('signup_status', 'pending')

  return {
    totalRequests:      totalRequests      ?? 0,
    requestsThisMonth:  requestsThisMonth  ?? 0,
    pendingReview:      pendingReview      ?? 0,
    completedThisMonth: completedThisMonth ?? 0,
    activeUsers:        activeUsers        ?? 0,
    pendingApprovals:   pendingApprovals   ?? 0,
  }
}

// ─── getRecentAdminRequests (last 10) ─────────────────────────────────────────

export async function getRecentAdminRequests(): Promise<RequestWithRelations[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const admin = createAdminClient()

  const { data: caller } = await admin
    .from('users').select('role').eq('auth_id', user.id).single()
  if (caller?.role !== 'admin') return []

  const { data, error } = await admin
    .from('requests')
    .select(
      `
      id, ticket_number, title, description, request_type,
      status_id, category_id, location_id, priority_id, requester_id,
      created_at, updated_at,
      statuses ( status_name ),
      categories ( category_name ),
      locations ( building_name, floor_level, room_number ),
      priorities ( level ),
      users ( full_name, email, department )
      `
    )
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('getRecentAdminRequests error:', error)
    return []
  }

  return (data ?? []) as unknown as RequestWithRelations[]
}