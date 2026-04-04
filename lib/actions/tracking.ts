'use server';

import { createClient } from '@/lib/supabase/server';
import type { StatusHistoryEntry } from '@/lib/types/tracking';

/**
 * Fetch full status history for a request.
 * Accessible to: requester (own), clerk, supervisor, admin, technician.
 */
export async function fetchStatusHistory(requestId: string): Promise<StatusHistoryEntry[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('status_history')
        .select(`
            id,
            request_id,
            changed_at,
            change_reason,
            metadata,
            old_status:statuses!old_status_id(id, status_name),
            new_status:statuses!new_status_id(id, status_name),
            changed_by_user:users!changed_by(id, full_name, role)
        `)
        .eq('request_id', requestId)
        // .eq('is_active', true)   // ← remove this line
        .order('changed_at', { ascending: true });

    if (error) {
        console.error('fetchStatusHistory error:', error);
        return [];
    }
    return data as unknown as StatusHistoryEntry[];
}