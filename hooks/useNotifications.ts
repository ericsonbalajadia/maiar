// hooks/useNotifications.ts
'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FEATURES } from '@/config/features';
import { useNotificationStore } from '@/stores/notification.store';

/**
 * Subscribes to new notifications for the current user.
 * Increments the Zustand unread counter on each INSERT.
 *
 * Feature flag: FEATURES.REALTIME_NOTIFICATIONS
 */
export function useNotifications(userId: string) {
  const increment = useNotificationStore((s) => s.increment);

  useEffect(() => {
    if (!FEATURES.REALTIME_NOTIFICATIONS || !userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          increment();
          // Extend: trigger a toast library here if needed
          // e.g., toast.info(payload.new.subject)
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, increment]);
}