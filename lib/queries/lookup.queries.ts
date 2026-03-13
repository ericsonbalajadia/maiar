// lib/queries/lookup.queries.ts
import { createClient } from "@/lib/supabase/server";

export async function getActiveLocations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*')  // ← select all columns
    .eq('is_active', true)
    .order('building_name');
  return { data, error };
}

export async function getActiveCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')  // ← select all columns
    .eq('is_active', true)
    .order('category_name');
  return { data, error };
}

export async function getPriorities() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('priorities')
    .select('*')  // ← select all columns
    .order('response_time_hours');
  return { data, error };
}

export async function getActiveTechnicians() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email")
    .eq("role", "technician")
    .eq("is_active", true)
    .eq("signup_status", "approved")
    .order("full_name");
  return { data, error };
}

export async function getUnreadNotifications(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, subject, message, created_at, request_id")
    .eq("user_id", userId)
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(20);
  return { data, error };
}

export async function getAccomplishmentByRequest(requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accomplishments")
    .select(
      `
      *,
      conductor:users!conducted_by(id, full_name),
      verifier:users!verified_by(id, full_name)
    `,
    )
    .eq("request_id", requestId)
    .maybeSingle(); // null = not yet created – not an error
  return { data, error };
}
