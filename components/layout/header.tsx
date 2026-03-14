// components/layout/header.tsx
'use client';

import { NotificationBell } from '@/components/notifications/notification-bell';
import { useNotificationStore } from '@/stores/notification.store';
import { useEffect } from 'react';

interface Props {
  userName: string;
  userId: string;
  initialNotificationCount: number;
}

export function Header({ userName, userId, initialNotificationCount }: Props) {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  // Seed Zustand with SSR count on first render
  useEffect(() => {
    setUnreadCount(initialNotificationCount);
  }, [initialNotificationCount, setUnreadCount]);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-end">
      <div /> {/* Left placeholder */}
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
            <span className="text-xs font-bold text-teal-700">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}