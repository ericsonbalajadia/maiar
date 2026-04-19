// components/notifications/notification-provider.tsx
'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/stores/notification.store';
import { useNotifications } from '@/hooks/useNotifications';
import { getUnreadCount } from '@/actions/notifications/notifications.actions';

interface Props {
  userId: string;
}

export function NotificationProvider({ userId }: Props) {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  useEffect(() => {
    let isMounted = true;
    getUnreadCount().then((count) => {
      if (isMounted) setUnreadCount(count);
    });
    return () => { isMounted = false; };
  }, [userId, setUnreadCount]);

  // Start realtime subscription
  useNotifications(userId);

  return null;
}