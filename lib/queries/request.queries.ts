// lib/queries/request.queries.ts
import { createClient } from "@/lib/supabase/server";
import type { RequestWithDetails, RequestSummary } from "@/types/models";
import type { RequestDetail } from "@/types/requests.model";
import { createServiceClient } from "@/lib/supabase/service";

// lib/queries/request.queries.ts
export async function getRequestById(id: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("requests")
    .select(
      `
      id,
      ticket_number,
      title,
      description,
      request_type,
      created_at,
      updated_at,
      statuses:statuses ( id, status_name ),
      locations:locations ( id, building_name, floor_level, room_number ),
      priorities:priorities ( id, level ),   
      categories:categories ( id, category_name ),
      requester:users!requests_requester_id_fkey ( id, full_name, email, department ),
      assigned_technician:users!assigned_technician_id (
        id, full_name, email, role
      ),
      rmr_details (
        id, inspection_date, inspection_time_start, inspection_time_end,
        inspector_notes, repair_mode, materials_available, manpower_required,
        estimated_duration, schedule_notes
      ),
      ppsr_details (
        id, service_type, service_data
      ),
      attachments (
        id, file_name, file_path, file_size, mime_type, created_at, uploaded_by
      ),
      request_reviews (
        id, decision, review_notes, reviewed_at,
        reviewer:users!request_reviews_reviewer_id_fkey ( full_name )
      ),
      request_assignments (
        id, assigned_at, completed_at, notes, acceptance_status,
        scheduled_start, scheduled_end, schedule_notes,
        technician:users!request_assignments_assigned_user_id_fkey ( id, full_name, email )
      ),
      status_history (
        id, changed_at, change_reason, metadata,
        old_status:old_status_id ( id, status_name ),
        new_status:new_status_id ( id, status_name ),
        changed_by_user:changed_by ( id, full_name, role )
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  console.log("DEBUG getRequestById - requester field:", data?.requester);
  console.log("DEBUG full data keys:", Object.keys(data || {}));

  if (error) {
    console.error("getRequestById error:", error);
    return { data: null, error };
  }

  return { data: data as RequestDetail | null, error: null };
}

// Used by /requester/requests list view.
export async function getRequestsByRequester(requesterId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .select(
      `
      id,
      ticket_number,
      title,
      request_type,
      created_at,
      status:statuses(status_name),
      priority:priorities(level),
      location:locations(building_name)
    `,
    )
    .eq("requester_id", requesterId)
    .order("created_at", { ascending: false });
  return { data: data as RequestSummary[] | null, error };
}

// Returns pending + under_review requests for the clerk queue.
export async function getRequestsForClerk() {
  const supabase = await createClient();
  const { data: statusRows } = await supabase
    .from("statuses")
    .select("id")
    .in("status_name", ["pending", "under_review"]);
  const ids = statusRows?.map((s) => s.id) ?? [];
  const { data, error } = await supabase
    .from("requests")
    .select(
      `
      id,
      ticket_number,
      title,
      request_type,
      created_at,
      status:statuses(status_name),
      priority:priorities(level),
      location:locations(building_name),
      requester:users!requester_id(full_name)
    `,
    )
    .in("status_id", ids)
    .order("created_at", { ascending: true }); // FIFO
  return { data, error };
}

// Returns approved + assigned + in_progress requests.
export async function getRequestsForSupervisor() {
  const supabase = await createClient();
  const { data: statusRows } = await supabase
    .from("statuses")
    .select("id")
    .in("status_name", ["approved", "assigned", "in_progress"]);
  const ids = statusRows?.map((s) => s.id) ?? [];
  const { data, error } = await supabase
    .from("requests")
    .select(
      `
      id,
      ticket_number,
      title,
      request_type,
      created_at,
      assigned_technician_id,
      status:statuses(status_name),
      priority:priorities(level),
      location:locations(building_name),
      requester:users!requester_id(full_name)
    `,
    )
    .in("status_id", ids)
    .order("created_at", { ascending: true });
  return { data, error };
}

// Returns assigned + in_progress for a specific technician.
export async function getRequestsForTechnician(technicianId: string) {
  const supabase = await createClient();
  const { data: statusRows } = await supabase
    .from("statuses")
    .select("id")
    .in("status_name", ["assigned", "in_progress"]);
  const ids = statusRows?.map((s) => s.id) ?? [];
  const { data, error } = await supabase
    .from("requests")
    .select(
      `
      id,
      ticket_number,
      title,
      request_type,
      created_at,
      status:statuses(status_name),
      priority:priorities(level),
      location:locations(building_name)
    `,
    )
    .in("status_id", ids)
    .eq("assigned_technician_id", technicianId)
    .order("created_at", { ascending: true });
  return { data, error };
}

export async function getCurrentAssignment(
  requestId: string,
  technicianId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("request_assignments")
    .select("id, acceptance_status, notes")
    .eq("request_id", requestId)
    .eq("assigned_user_id", technicianId)
    .eq("is_current_assignment", true)
    .maybeSingle(); // returns null if not found
  return { data, error };
}

/**
 * Returns the current active assignment for a request,
 * including the assigned technician's full name.
 * RLS: requesters can read assignments for their own requests.
 */
export async function getRequestAssignment(requestId: string) {
  const supabase = createServiceClient(); // ← use service client

  const { data, error } = await supabase
    .from("request_assignments")
    .select(
      `
      id,
      assigned_at,
      completed_at,
      acceptance_status,
      acceptance_status,
      scheduled_start,
      scheduled_end,
      schedule_notes,
      notes,
      is_current_assignment,
      assigned_user:users!assigned_user_id (
        id,
        full_name,
        role
      )
    `,
    )
    .eq("request_id", requestId)
    .eq("is_current_assignment", true)
    .order("assigned_at", { ascending: false })
    .maybeSingle();

  return { data, error };
}

// Shape returned by getRequestAssignment:
export type AssignmentWithTechnician = {
  id: string;
  assigned_at: string;
  acceptance_status: string | null;
  notes: string | null;
  is_current_assignment: boolean;
  scheduled_start: string | null;
  scheduled_end: string | null;
  schedule_notes: string | null;
  assigned_user: {
    id: string;
    full_name: string;
    role: string;
  } | null;
};

export type RequestFilter = {
  role: 'clerk' | 'supervisor' | 'admin';
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function getFilteredRequests(filter: RequestFilter) {
  const supabase = createServiceClient();
  const {
    role,
    status,
    category,
    priority,
    search,
    page = 1,
    pageSize = 20,
  } = filter;

  let query = supabase
    .from('requests')
    .select(
      `
        id,
        ticket_number,
        title,
        created_at,
        updated_at,
        status:status_id ( status_name ),
        priority:priority_id ( level ),
        category:category_id ( category_name ),
        requester:requester_id ( full_name ),
        request_assignments (
          assigned_user:assigned_user_id ( full_name ),
          completed_at
        )
      `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status) query = query.eq('status.status_name', status);
  if (category) query = query.eq('category.category_name', category);
  if (priority) query = query.eq('priority.level', priority);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error, count } = await query;
  return {
    data,
    error,
    count,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}