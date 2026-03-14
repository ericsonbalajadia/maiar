// components/notifications/notification-provider.tsx
'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/stores/notification.store';
import { useNotifications } from '@/hooks/useNotifications';

interface Props {
  userId: string;
  initialCount: number;
}

export function NotificationProvider({ userId, initialCount }: Props) {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  useEffect(() => {
    setUnreadCount(initialCount);
  }, [initialCount, setUnreadCount]);

  useNotifications(userId); // starts realtime subscription (gated by feature flag)

  return null;
}