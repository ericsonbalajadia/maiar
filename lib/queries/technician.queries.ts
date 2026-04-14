'use server';

import { createServiceClient } from '@/lib/supabase/service';

export type AvailableTechnician = {
  id: string;
  full_name: string;
  email: string;
  specialization: string | null;
  is_available: boolean;
  active_assignments: number;
};

/**
 * Returns all approved technicians with their current workload.
 * Uses service client to bypass RLS on users / technician_info tables.
 */
export async function getAvailableTechnicians(): Promise<AvailableTechnician[]> {
  const supabase = createServiceClient();

  // Fetch approved technicians
  const { data: technicians, error } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      technician_info ( specialization, is_available )
    `)
    .eq('role', 'technician')
    .eq('signup_status', 'approved')
    .eq('is_active', true);

  if (error) {
    console.error('[getAvailableTechnicians]', error.message);
    return [];
  }

  // Fetch active assignment counts
  const { data: counts } = await supabase
    .from('request_assignments')
    .select('assigned_user_id')
    .is('completed_at', null);

  const countMap: Record<string, number> = {};
  (counts ?? []).forEach((row) => {
    countMap[row.assigned_user_id] = (countMap[row.assigned_user_id] ?? 0) + 1;
  });

  return (technicians ?? []).map((t) => {
    const info = Array.isArray(t.technician_info)
      ? t.technician_info[0]
      : t.technician_info;
    return {
      id: t.id,
      full_name: t.full_name,
      email: t.email,
      specialization: info?.specialization ?? null,
      is_available: info?.is_available ?? true,
      active_assignments: countMap[t.id] ?? 0,
    };
  });
}

/**
 * Returns requests with status 'approved' for supervisor queue.
 */
export async function getApprovedRequests() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('requests')
    .select(`
      id, ticket_number, title, created_at,
      priorities ( level ),
      categories ( category_name ),
      locations ( building_name, room_number ),
      statuses ( status_name ),
      requester:users!requests_requester_id_fkey ( full_name, email )
    `)
    .eq('statuses.status_name', 'approved')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[getApprovedRequests]', error);
    return [];
  }
  return data ?? [];
}