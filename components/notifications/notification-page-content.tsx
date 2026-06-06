// components/notifications/notification-page-content.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckCheck, Wrench, ClipboardList, CheckCircle2, XCircle,
  AlertTriangle, Info, ExternalLink, Inbox,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getNotificationsPage,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRow,
} from "@/actions/notifications/notifications.actions";
import { useNotificationStore } from "@/stores/notification.store";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const TYPE_META: Record<string, { icon: React.ElementType; label: string; color: string; bg: string; border: string }> = {
  new_user_registered: { icon: UserPlus,       label: 'Registration', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-[#ADEBB3]/70 dark:border-white/10' },
  request_submitted:    { icon: ClipboardList, label: 'Submitted',   color: 'text-[#527255]',   bg: 'bg-[#ADEBB3]/35 dark:bg-white/[0.06]',   border: 'border-[#ADEBB3]/70 dark:border-white/10' },
  request_approved:     { icon: CheckCircle2,  label: 'Approved',    color: 'text-[#527255]', bg: 'bg-[#ADEBB3]/35 dark:bg-white/[0.06]', border: 'border-[#ADEBB3]/70 dark:border-white/10' },
  request_rejected:     { icon: XCircle,       label: 'Rejected',    color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-900/20',   border: 'border-rose-200 dark:border-rose-800/50' },
  technician_assigned:  { icon: Wrench,        label: 'Assigned',    color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-white/[0.06]', border: 'border-indigo-200 dark:border-indigo-800/50' },
  request_completed:    { icon: CheckCircle2,  label: 'Completed',   color: 'text-[#527255]',    bg: 'bg-[#ADEBB3]/35 dark:bg-white/[0.06]',   border: 'border-[#ADEBB3]/70 dark:border-white/10' },
  request_cancelled:    { icon: XCircle,       label: 'Cancelled',   color: 'text-slate-500',   bg: 'bg-[#ADEBB3]/25 dark:bg-white/[0.04]', border: 'border-[#ADEBB3]/70 dark:border-white/10' },
  status_updated:       { icon: CheckCircle2,  label: 'Updated',     color: 'text-[#527255]',    bg: 'bg-[#ADEBB3]/35 dark:bg-white/[0.06]',   border: 'border-[#ADEBB3]/70 dark:border-white/10' },
  feedback_requested:   { icon: AlertTriangle, label: 'Feedback',    color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-[#ADEBB3]/70 dark:border-white/10' },
  system:               { icon: Info,          label: 'System',      color: 'text-slate-500',   bg: 'bg-[#ADEBB3]/25 dark:bg-white/[0.04]', border: 'border-[#ADEBB3]/70 dark:border-white/10' },
};

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

function NotifCard({
  notif,
  pathname,
  onRead,
}: {
  notif: NotificationRow;
  pathname: string;
  onRead: (id: string) => void;
}) {
  const meta = TYPE_META[notif.type] ?? TYPE_META["system"];
  const Icon = meta.icon;
  const isUnread = notif.read_at === null;
  const isRequester = pathname.startsWith('/requester');
  const isClerk = pathname.startsWith('/clerk');
  const metaColor = isClerk && meta.color === 'text-[#527255]' ? 'text-[#58855C]' : meta.color;
  const metaBg = isClerk && meta.bg.includes('#ADEBB3') ? meta.bg.replace(/#ADEBB3/g, '#58855C') : meta.bg;
  const metaBorder = isClerk && meta.border.includes('#ADEBB3') ? meta.border.replace(/#ADEBB3/g, '#58855C') : meta.border;

  // Build href based on notification type and user role
  let href: string | null = null;
  if (notif.type === "new_user_registered") {
    if (pathname.startsWith("/admin")) {
      href = "/admin/users/pending";
    } else if (pathname.startsWith("/clerk")) {
      href = "/clerk/account-requests";
    } else if (pathname.startsWith("/supervisor")) {
      href = "/supervisor/account-requests"; // or any appropriate page
    } else {
      href = "/";
    }
  } else if (notif.request_id) {
    if (pathname.startsWith("/clerk")) {
      href = `/clerk/requests/${notif.request_id}`;
    } else if (pathname.startsWith("/supervisor")) {
      href = `/supervisor/requests/${notif.request_id}`;
    } else if (pathname.startsWith('/admin')) {
      href = `/admin/requests/${notif.request_id}`;
    } else {
      href = `/requester/requests/${notif.request_id}`;
    }
  }

  const handleClick = () => {
    if (isUnread) onRead(notif.id);
  };

  const inner = (
    <div
      className={cn(
        "group relative rounded-xl border transition-all duration-200",
        isUnread
          ? `${isRequester ? 'border-[#ADEBB3]/70 dark:border-white/10' : metaBorder} ${metaBg} hover:shadow-sm`
          : isRequester
            ? 'border-[#ADEBB3]/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] hover:bg-[#ADEBB3]/35 dark:hover:bg-white/[0.08]'
            : isClerk
              ? 'border-[#58855C]/25 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] hover:bg-[#58855C]/10 dark:hover:bg-white/[0.08]'
              : 'border-[#ADEBB3]/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] hover:bg-[#ADEBB3]/35 dark:hover:bg-white/[0.08]'
      )}
      onClick={handleClick}
    >
      {isUnread && (
        <div
          className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${metaColor.replace("text-", "bg-")} opacity-60`}
        />
      )}

      <div className="flex items-start gap-3 p-4">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', metaBg, 'border', isRequester ? 'border-[#ADEBB3]/70 dark:border-white/10' : metaBorder)}>
          <Icon className={cn('h-4 w-4', metaColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn('text-sm leading-snug', isUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-white/80')}>
              {notif.subject}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 dark:text-white/45 whitespace-nowrap">
                {relativeTime(notif.created_at)}
              </span>
              {isUnread && (
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              )}
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-white/60 mt-1 leading-relaxed">{notif.message}</p>
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            <span
              className={cn(
                "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                metaBg,
                metaColor,
              )}
            >
              {meta.label}
            </span>
            {notif.requests?.ticket_number && href && (
              <Link
                href={href}
                className={cn("inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-white/60 dark:hover:text-emerald-300 transition-colors", isClerk ? "hover:text-[#58855C]" : "hover:text-[#527255]")}
                onClick={() => isUnread && onRead(notif.id)}
              >
                {notif.requests.ticket_number}
                <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            )}
            {isUnread && (
              <button onClick={() => onRead(notif.id)} className={cn("text-[11px] font-semibold transition-colors ml-auto", isClerk ? "text-[#58855C] hover:text-[#466b4a] dark:text-emerald-300" : "text-blue-600 dark:text-blue-400 hover:text-[#527255]")}>
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function NotificationsPageContent() {
  const pathname = usePathname();
  const isRequester = pathname.startsWith('/requester');
  const isClerk = pathname.startsWith('/clerk');
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  const load = (p: number) => {
    setLoading(true);
    getNotificationsPage(p, pageSize).then(({ data, total: t }) => {
      setNotifications(data ?? []);
      setTotal(t);
      setLoading(false);
    });
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const handleMarkAll = () => {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
      );
      setUnreadCount(0);
    });
  };

  const handleMarkOne = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
      ),
    );
    const newUnreadCount =
      notifications.filter((n) => n.read_at === null).length - 1;
    setUnreadCount(Math.max(0, newUnreadCount));
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return n.read_at === null;
    if (filter === "read") return n.read_at !== null;
    return true;
  });

  const unreadCount = notifications.filter((n) => n.read_at === null).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={cn('text-xs font-semibold uppercase tracking-widest mb-1', isRequester ? 'text-[#527255] dark:text-emerald-300' : isClerk ? 'text-[#58855C] dark:text-emerald-300' : 'text-blue-500 dark:text-blue-400')}>Notifications</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notification Center</h1>
          <p className="text-sm text-slate-500 dark:text-white/60 mt-0.5">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.` : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={isPending}
            className={cn('gap-1.5 shrink-0', isRequester ? 'text-[#1e2c1f] border-[#ADEBB3]/70 dark:border-white/10 hover:bg-[#ADEBB3]/35 dark:hover:bg-white/[0.08]' : isClerk ? 'text-[#58855C] border-[#58855C]/25 dark:border-white/10 hover:bg-[#58855C]/10 dark:hover:bg-white/[0.08]' : 'text-blue-600 border-[#ADEBB3]/70 dark:border-white/10 hover:bg-[#ADEBB3]/35 dark:hover:bg-white/[0.08]')}>
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      <div className={cn('flex items-center gap-1 p-1 rounded-xl border w-fit', isRequester ? 'border-[#ADEBB3]/70 dark:border-white/10' : isClerk ? 'border-[#58855C]/25 dark:border-white/10' : 'border-[#ADEBB3]/70 dark:border-white/10')} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)' }}>
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value as typeof filter)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150",
              filter === value
                ? isRequester ? 'bg-white dark:bg-white/[0.05] text-[#1e2c1f] dark:text-emerald-300 shadow-sm border border-[#ADEBB3]/70 dark:border-white/10' : isClerk ? 'bg-white dark:bg-white/[0.05] text-[#58855C] dark:text-emerald-300 shadow-sm border border-[#58855C]/25 dark:border-white/10' : 'bg-white dark:bg-white/[0.05] text-slate-900 dark:text-white shadow-sm'
                : isClerk ? 'text-slate-500 dark:text-white/60 hover:text-[#58855C] dark:hover:text-emerald-300' : 'text-slate-500 dark:text-white/60 hover:text-[#527255] dark:hover:text-[#527255]'
            )}
          >
            {label}
            {value === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 text-[10px] font-bold bg-blue-100 dark:bg-white/[0.06] text-blue-600 dark:text-blue-300 px-1.5 py-px rounded-full">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={cn('rounded-xl border p-4 flex gap-3 bg-white/60 dark:bg-white/[0.04]', isRequester ? 'border-[#ADEBB3]/70 dark:border-white/10' : isClerk ? 'border-[#58855C]/25 dark:border-white/10' : 'border-[#ADEBB3]/70 dark:border-white/10')}>
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.05] animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 dark:bg-white/[0.05] rounded-full animate-pulse w-2/3" />
                <div className="h-3.5 bg-slate-50 dark:bg-white/[0.05] rounded-full animate-pulse w-full" />
                <div className="h-3 bg-slate-50 dark:bg-white/[0.05] rounded-full animate-pulse w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={cn('rounded-2xl border flex flex-col items-center justify-center py-16 text-center', isRequester ? 'border-[#ADEBB3]/70 dark:border-white/10' : isClerk ? 'border-[#58855C]/25 dark:border-white/10' : 'border-[#ADEBB3]/70 dark:border-white/10')} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)' }}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-4">
            {filter === 'unread' ? <CheckCheck className={cn("h-6 w-6", isClerk ? "text-[#58855C]" : "text-[#8dc192]")} /> : <Inbox className="h-6 w-6 text-slate-400" />}
          </div>
          <p className="text-base font-semibold text-slate-700 dark:text-white/80">{filter === 'unread' ? 'All caught up!' : 'No notifications'}</p>
          <p className="text-sm text-slate-400 dark:text-white/45 mt-1 max-w-xs">
            {filter === 'unread' ? "No unread notifications. You're all up to date." : 'No notifications in this category yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((notif) => (
            <NotifCard
              key={notif.id}
              notif={notif}
              pathname={pathname}
              onRead={handleMarkOne}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400 dark:text-white/45">Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="h-8 px-3 text-xs">Previous</Button>
            <span className="text-xs font-medium text-slate-600 dark:text-white/60 min-w-[60px] text-center">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="h-8 px-3 text-xs">Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
