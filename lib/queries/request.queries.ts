// lib/queries/request.queries.ts
import { createClient } from "@/lib/supabase/server";
import type { RequestWithDetails, RequestSummary } from "@/types/models";

export async function getRequestById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .select(
      `
      *,
      status:statuses(*),
      priority:priorities(*),
      location:locations(*),
      category:categories(*),
      requester:users!requester_id(id, full_name, email, role),
      rmr_details(*),
      ppsr_details(*)
    `,
    )
    .eq("id", id)
    .single();
  return { data: data as RequestWithDetails | null, error };
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

export async function getCurrentAssignment(requestId: string, technicianId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('request_assignments')
    .select('id, acceptance_status, notes')
    .eq('request_id', requestId)
    .eq('assigned_user_id', technicianId)
    .eq('is_current_assignment', true)
    .maybeSingle(); // returns null if not found
  return { data, error };
}
