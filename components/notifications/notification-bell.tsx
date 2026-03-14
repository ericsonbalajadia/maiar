// components/notifications/notification-bell.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotificationStore } from '@/stores/notification.store';

function notificationHref(pathname: string): string {
  if (pathname.startsWith('/clerk')) return '/clerk/notifications';
  if (pathname.startsWith('/supervisor')) return '/supervisor/notifications';
  if (pathname.startsWith('/technician')) return '/technician/notifications';
  if (pathname.startsWith('/admin')) return '/admin/notifications';
  return '/requester/notification';
}

export function NotificationBell() {
  const count = useNotificationStore((s) => s.unreadCount);
  const pathname = usePathname();
  const href = notificationHref(pathname);

  return (
    <Link
      href={href}
      className="relative p-2 text-slate-500 hover:text-teal-600 transition-colors"
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
    >
      {/* Replace with lucide BellIcon if available */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}