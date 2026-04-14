// hooks/useRequestStatus.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FEATURES } from '@/config/features';

/**
 * Subscribes to realtime changes on the requests table for a single row.
 * Returns the live status name; resolved via a follow-up statuses query.
 *
 * Feature flag: FEATURES.REALTIME_REQUEST_STATUS
 */
export function useRequestStatus(
  requestId: string,
  initialStatusName: string
): string {
  const [statusName, setStatusName] = useState(initialStatusName);

  useEffect(() => {
    if (!FEATURES.REALTIME_ENABLED) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`request-status-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
          filter: `id=eq.${requestId}`,
        },
        async (payload) => {
          const newStatusId = (payload.new as { status_id: string }).status_id;
          const { data } = await supabase
            .from('statuses')
            .select('status_name')
            .eq('id', newStatusId)
            .single();
          if (data) setStatusName(data.status_name);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  return statusName;
}