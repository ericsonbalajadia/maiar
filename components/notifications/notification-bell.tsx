// components/notifications/notification-bell.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotificationStore } from "@/stores/notification.store";
import {
  Bell,
  X,
  CheckCheck,
  ExternalLink,
  Clock,
  Wrench,
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  markAllNotificationsRead,
  markNotificationRead,
  getNotificationsForPanel,
} from "@/actions/notifications/notifications.actions";

interface Notification {
  id: string;
  type: string;
  subject: string;
  message: string;
  read_at: string | null;
  created_at: string;
  request_id: string | null;
  requests?: { ticket_number: string; title: string } | null;
}

function notificationHref(pathname: string): string {
  if (pathname.startsWith("/clerk")) return "/clerk/notifications";
  if (pathname.startsWith("/supervisor")) return "/supervisor/notifications";
  if (pathname.startsWith("/technician")) return "/technician/notifications";
  if (pathname.startsWith("/admin")) return "/admin/notifications";
  return "/requester/notifications";
}

function requestHref(pathname: string, requestId: string): string {
  if (pathname.startsWith("/clerk")) return `/clerk/requests/${requestId}/review`;
  if (pathname.startsWith("/supervisor")) return `/supervisor/requests/${requestId}`;
  if (pathname.startsWith("/technician")) return `/technician/requests/${requestId}`;
  if (pathname.startsWith("/admin")) return `/admin/requests/${requestId}`;
  return `/requester/requests/${requestId}`;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

const TYPE_META: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  new_user_registered: {
    icon: UserPlus,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  request_submitted: {
    icon: ClipboardList,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  request_approved: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  request_rejected: {
    icon: XCircle,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-900/20",
  },
  technician_assigned: {
    icon: Wrench,
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  status_updated: {
    icon: CheckCircle2,
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  feedback_requested: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  system: {
    icon: Info,
    color: "text-slate-500",
    bg: "bg-slate-50 dark:bg-slate-800/40",
  },
  request_completed: {
    icon: CheckCircle2,
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  request_cancelled: {
    icon: XCircle,
    color: "text-slate-500",
    bg: "bg-slate-50 dark:bg-slate-800/40",
  },
};

function NotifItem({
  notif,
  pathname,
  onRead,
}: {
  notif: Notification;
  pathname: string;
  onRead: (id: string) => void;
}) {
  const meta = TYPE_META[notif.type] ?? TYPE_META["system"];
  const Icon = meta.icon;

  let href: string | null = null;

  // Special case: new_user_registered notifications
  if (notif.type === "new_user_registered") {
    if (pathname.startsWith("/admin")) {
      href = "/admin/users/pending";
    } else if (pathname.startsWith("/clerk")) {
      href = "/clerk/account-requests";
    } else if (pathname.startsWith("/supervisor")) {
      href = "/supervisor/account-requests";
    } else {
      href = "/";
    }
  }
  // Normal request‑linked notifications
  else if (notif.request_id) {
    href = requestHref(pathname, notif.request_id);
  }

  const handleClick = () => {
    if (notif.read_at === null) onRead(notif.id);
  };

  const inner = (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors duration-150 border-b border-slate-100/60 dark:border-slate-800/60 last:border-0",
        notif.read_at === null
          ? "bg-blue-50/40 dark:bg-blue-950/10 hover:bg-blue-50/70 dark:hover:bg-blue-950/20"
          : "hover:bg-slate-50/60 dark:hover:bg-slate-800/30",
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
          meta.bg,
        )}
      >
        <Icon className={cn("h-4 w-4", meta.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm leading-snug truncate",
            notif.read_at === null
              ? "font-semibold text-slate-900 dark:text-white"
              : "font-medium text-slate-700 dark:text-slate-300",
          )}
        >
          {notif.subject}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
          {notif.message}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {relativeTime(notif.created_at)}
          </span>
          {notif.requests?.ticket_number && (
            <>
              <span className="text-slate-200 dark:text-slate-700">·</span>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate">
                {notif.requests.ticket_number}
              </span>
            </>
          )}
        </div>
      </div>
      {notif.read_at === null && (
        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5 shadow-sm shadow-blue-500/50" />
      )}
    </div>
  );

  if (href)
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  return inner;
}

export function NotificationBell() {
  const count = useNotificationStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const pathname = usePathname();
  const allNotifsHref = notificationHref(pathname);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getNotificationsForPanel().then((result) => {
      setNotifications(result.data ?? []);
      setLoading(false);
    });
  }, [open]);

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
    );
  };

  const handleMarkOneRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
      ),
    );
  };

  const unread = notifications.filter((n) => n.read_at === null);

  useEffect(() => {
    setUnreadCount(unread.length);
  }, [unread.length, setUnreadCount]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
        className={cn(
          "relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150",
          open
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200",
        )}
      >
        <Bell className="h-4.5 w-4.5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 px-0.5 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-[10px] font-bold text-white shadow-sm leading-none">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 sm:hidden bg-black/20"
            onClick={() => setOpen(false)}
          />

          <div
            ref={panelRef}
            className={cn(
              "absolute right-0 top-full mt-2 z-50",
              "w-[360px] max-w-[calc(100vw-1rem)]",
              "rounded-2xl",
              "shadow-2xl shadow-black/20 dark:shadow-black/40",
              "overflow-hidden",
              "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200",
            )}
            style={{
              background: "var(--glass-sidebar)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 dark:border-white/5 bg-white/30 dark:bg-slate-900/30">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Notifications
                </h3>
                {unread.length > 0 && (
                  <span className="text-[11px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                    {unread.length} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50/70 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto overscroll-contain">
              {loading ? (
                <div className="space-y-0">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-4 py-3 border-b border-white/10 dark:border-white/5 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-full animate-pulse w-3/4" />
                        <div className="h-3 bg-slate-100/60 dark:bg-slate-800/60 rounded-full animate-pulse w-full" />
                        <div className="h-2.5 bg-slate-100/60 dark:bg-slate-800/60 rounded-full animate-pulse w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center mb-3">
                    <Bell className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    All caught up!
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    No notifications yet.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <NotifItem
                    key={notif.id}
                    notif={notif}
                    pathname={pathname}
                    onRead={handleMarkOneRead}
                  />
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-white/20 dark:border-white/5 bg-slate-50/30 dark:bg-slate-900/30">
                <Link
                  href={allNotifsHref}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 py-1 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors w-full"
                >
                  View all notifications
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}