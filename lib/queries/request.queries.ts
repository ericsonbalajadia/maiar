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
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};

export async function getFilteredRequests(filter: RequestFilter) {
  const supabase = createServiceClient();
  const {
    status,
    priority,
    search,
    startDate,
    endDate,
    page = 1,
    pageSize = 20,
  } = filter;

  // Get status_id, priority_id from name filters
  let statusId: string | undefined;
  if (status) {
    const { data: s } = await supabase
      .from('statuses')
      .select('id')
      .eq('status_name', status)
      .single();
    statusId = s?.id;
  }

  let priorityId: string | undefined;
  if (priority) {
    const { data: p } = await supabase
      .from('priorities')
      .select('id')
      .eq('level', priority)
      .single();
    priorityId = p?.id;
  }

  // Build query with count
  let query = supabase
    .from('requests')
    .select(
      `
        id,
        ticket_number,
        title,
        created_at,
        updated_at,
        request_type,
        status:status_id ( status_name ),
        priority:priority_id ( level ),
        category:category_id ( category_name ),
        requester:requester_id ( full_name )
      `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (statusId) query = query.eq('status_id', statusId);
  if (priorityId) query = query.eq('priority_id', priorityId);
  if (search) {
    query = query.or(`ticket_number.ilike.%${search}%,title.ilike.%${search}%`);
  }
  if (startDate) query = query.gte('created_at', `${startDate}T00:00:00Z`);
  if (endDate) query = query.lte('created_at', `${endDate}T23:59:59Z`);

  const { data, error, count } = await query;

  if (error) {
    console.error('Supabase query error:', error);
    return { data: [], error, count: 0, totalPages: 0 };
  }

  return {
    data: data ?? [],
    error: null,
    count: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

// Get backlog counts for admin dashboard
type BacklogCounts = {
  pending: number;
  under_review: number;
  approved: number;
  assigned: number;
  in_progress: number;
  completed: number;
  cancelled: number;
};

export async function getBacklogCounts(): Promise<{ data: BacklogCounts | null; error: Error | null }> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('requests')
    .select('statuses!inner(status_name)');

  if (error) return { data: null, error };

  const counts: BacklogCounts = {
    pending: 0,
    under_review: 0,
    approved: 0,
    assigned: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };

  data?.forEach((row: any) => {
    const statusName = row.statuses?.status_name;
    if (statusName && statusName in counts) {
      counts[statusName as keyof BacklogCounts]++;
    }
  });

  return { data: counts, error: null };
}

// Get technician current active assignments
export async function getTechnicianWorkload() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      technician_info!inner ( specialization ),
      request_assignments!assigned_user_id (
        id,
        completed_at,
        is_current_assignment
      )
    `)
    .eq('role', 'technician')
    .eq('request_assignments.is_current_assignment', true)
    .is('request_assignments.completed_at', null);

  if (error) return { data: null, error };
  // Transform to get count per technician
  const workload = data.map((tech: any) => ({
    id: tech.id,
    name: tech.full_name,
    email: tech.email,
    specialization: tech.technician_info?.specialization || 'General',
    activeAssignments: tech.request_assignments?.length || 0,
  }));
  return { data: workload, error: null };
}

// Get user summary (total users, per role, pending approvals)
export async function getUserSummary() {
  const supabase = createServiceClient();
  const { data: allUsers } = await supabase.from('users').select('role, signup_status');
  const total = allUsers?.length || 0;
  const byRole: Record<string, number> = {};
  let pendingApprovals = 0;
  allUsers?.forEach((u: any) => {
    byRole[u.role] = (byRole[u.role] || 0) + 1;
    if (u.signup_status === 'pending') pendingApprovals++;
  });
  return { total, byRole, pendingApprovals };
}

// Get recent users for admin dashboard
export async function getRecentUsers(limit = 5) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, role, signup_status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data;
}

// Get requests related to a user (assigned or reviewed)
export async function getUserRequests(userId: string, role: string) {
  const supabase = createServiceClient();

  if (role === 'technician') {
    const { data, error } = await supabase
      .from('request_assignments')
      .select(`
        request_id,
        assigned_at,
        requests (
          id,
          ticket_number,
          title,
          created_at,
          status:status_id ( status_name )
        )
      `)
      .eq('assigned_user_id', userId)
      .order('assigned_at', { ascending: false });
    if (error) return [];
    return data.map((item: any) => ({
      id: item.requests.id,
      ticket_number: item.requests.ticket_number,
      title: item.requests.title,
      created_at: item.requests.created_at,
      status: item.requests.status ?? { status_name: 'unknown' },
      related_at: item.assigned_at,
    }));
  }

  if (role === 'clerk') {
    const { data, error } = await supabase
      .from('request_reviews')
      .select(`
        request_id,
        reviewed_at,
        decision,
        requests (
          id,
          ticket_number,
          title,
          created_at,
          status:status_id ( status_name )
        )
      `)
      .eq('reviewer_id', userId)
      .order('reviewed_at', { ascending: false });
    if (error) return [];
    return data.map((item: any) => ({
      id: item.requests.id,
      ticket_number: item.requests.ticket_number,
      title: item.requests.title,
      created_at: item.requests.created_at,
      status: item.requests.status ?? { status_name: 'unknown' },
      related_at: item.reviewed_at,
      decision: item.decision,
    }));
  }

  if (role === 'student' || role === 'staff') {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        id,
        ticket_number,
        title,
        created_at,
        status:status_id ( status_name )
      `)
      .eq('requester_id', userId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data.map((item: any) => ({
      id: item.id,
      ticket_number: item.ticket_number,
      title: item.title,
      created_at: item.created_at,
      status: item.status ?? { status_name: 'unknown' },
      related_at: item.created_at,
    }));
  }

  return [];
}