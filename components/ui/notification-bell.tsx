// components/ui/NotificationBell.tsx
'use client';

import { BellIcon } from 'lucide-react';
import Link from 'next/link';
import { useNotificationStore } from '@/stores/notification.store';

interface Props {
  basePath: string; // e.g. '/clerk' | '/supervisor' | '/technician' | '/requester'
}

export function NotificationBell({ basePath }: Props) {
  const count = useNotificationStore((s) => s.unreadCount);

  return (
    <Link
      href={`${basePath}/notifications`}
      className="relative p-2 text-slate-500 hover:text-teal-600 transition-colors"
    >
      <BellIcon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}