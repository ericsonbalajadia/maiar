// app/(dashboard)/clerk/page.tsx
import React from "react";
import { getRequestsForClerk } from "@/lib/queries/request.queries";
import { RequestCard } from "@/components/requests/request-card";
import { StatusUpdatePanel } from "@/components/clerk/status-update-panel";
import { ClipboardCheck, Clock, Eye, InboxIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  label,
  count,
  countColor,
  countBg,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  label: string;
  count: number;
  countColor: string;
  countBg: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <h2 className="text-base font-bold text-slate-800 dark:text-white">{label}</h2>
      <span
        className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold ${countBg} ${countColor}`}
      >
        {count}
      </span>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptySection({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/60 text-center">
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
        <InboxIcon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        No {label.toLowerCase()} requests
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
        All caught up.
      </p>
    </div>
  );
}

// ─── Request card + status panel wrapped in glass card ────────────────────────

function RequestCardWithActions({
  request,
  basePath,
}: {
  request: any;
  basePath: string;
}) {
  return (
    <div
      className="rounded-2xl border border-white/60 dark:border-slate-700/60 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)" }}
    >
      <RequestCard request={request} href={`${basePath}/${request.id}`} />
      <div className="border-t border-slate-100/80 dark:border-slate-800/60 px-4 py-3 bg-slate-50/40 dark:bg-slate-900/20">
        <StatusUpdatePanel
          requestId={request.id}
          currentStatus={request.status.status_name}
          ticketNumber={request.ticket_number ?? ""}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ClerkDashboardPage() {
  const { data: requests } = await getRequestsForClerk();

  const pending = requests?.filter((r) => r.status.status_name === "pending") ?? [];
  const underReview = requests?.filter((r) => r.status.status_name === "under_review") ?? [];

  const totalActive = pending.length + underReview.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto fade-in px-4 md:px-6">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-1">
            Clerk · Review Queue
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Review Queue
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Requests awaiting review — oldest first (FIFO)
          </p>
        </div>
        <Link
          href="/clerk/requests"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
        >
          <Eye className="h-4 w-4" />
          View All Requests
        </Link>
      </div>

      {/* ── Summary chips ── */}
      {totalActive > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40 px-3.5 py-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
            <Clock className="h-3.5 w-3.5" />
            {pending.length} pending
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/40 px-3.5 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
            <ClipboardCheck className="h-3.5 w-3.5" />
            {underReview.length} under review
          </div>
        </div>
      )}

      {/* ── Two‑column grid for Pending & Under Review ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Pending */}
        <div>
          <SectionHeader
            label="Pending"
            count={pending.length}
            countBg="bg-amber-100 dark:bg-amber-900/40"
            countColor="text-amber-700 dark:text-amber-300"
            icon={Clock}
            iconBg="bg-amber-50 dark:bg-amber-900/20"
            iconColor="text-amber-500"
          />
          {pending.length > 0 ? (
            <>
              <div className="space-y-4">
                {pending.map((r) => (
                  <RequestCardWithActions
                    key={r.id}
                    request={r}
                    basePath="/clerk/requests"
                  />
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Link
                  href="/clerk/requests?status=pending"
                  className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  View all pending
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <EmptySection label="Pending" />
          )}
        </div>

        {/* Right column: Under Review */}
        <div>
          <SectionHeader
            label="Under Review"
            count={underReview.length}
            countBg="bg-blue-100 dark:bg-blue-900/40"
            countColor="text-blue-700 dark:text-blue-300"
            icon={ClipboardCheck}
            iconBg="bg-blue-50 dark:bg-blue-900/20"
            iconColor="text-blue-500"
          />
          {underReview.length > 0 ? (
            <>
              <div className="space-y-4">
                {underReview.map((r) => (
                  <RequestCardWithActions
                    key={r.id}
                    request={r}
                    basePath="/clerk/requests"
                  />
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Link
                  href="/clerk/requests?status=under_review"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  View all under review
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <EmptySection label="Under Review" />
          )}
        </div>
      </div>
    </div>
  );
}