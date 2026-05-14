import React, { Suspense } from "react";
import { getRequestsForClerk } from "@/lib/queries/request.queries";
import { RequestCard } from "@/components/requests/request-card";
import { Button } from "@/components/ui/button";
import { Eye, InboxIcon } from "lucide-react";
import Link from "next/link";
import { ClerkDashboardSkeleton } from "./skeleton";
import { ReviewQueueFilter } from "@/components/clerk/review-queue-filter";

function EmptySection() {
  return (
    <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/60 text-center">
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center mb-3">
        <InboxIcon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        No requests in review
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
        All caught up.
      </p>
    </div>
  );
}

function ReviewCard({ request }: { request: any }) {
  return (
    <div
      className="rounded-2xl border border-white/60 dark:border-slate-700/60 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 relative z-0"
      style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)" }}
    >
      <RequestCard request={request} fullHref={`/clerk/requests/${request.id}/review`} />
      <div className="border-t border-slate-100/80 dark:border-slate-800/60 px-4 py-3 bg-slate-50/40 dark:bg-white/[0.04]">
        <StatusUpdatePanel
          requestId={request.id}
          currentStatus={request.status.status_name}
          ticketNumber={request.ticket_number ?? ""}
        />
      </div>
    </div>
  );
}

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function ClerkDashboardPage({ searchParams }: Props) {
  const sp = await searchParams;
  const typeFilter = sp.type === "rmr" || sp.type === "ppsr" ? sp.type : "all";

  const { data: requests } = await getRequestsForClerk();

  let underReview = requests?.filter((r) => r.status.status_name === "under_review") ?? [];
  if (typeFilter !== "all") {
    underReview = underReview.filter((r) => r.request_type === typeFilter);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto fade-in px-4 md:px-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-1">
            Clerk · Review Queue
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Review Queue</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Requests ready for review — oldest first
          </p>
        </div>
        <Link
          href="/clerk/requests"
          className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-white/[0.08]"
        >
          <Eye className="h-4 w-4" />
          View All Requests
        </Link>
      </div>

      {/* Summary chips */}
      {totalActive > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40 px-3.5 py-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
            <Clock className="h-3.5 w-3.5" /> {pending.length} pending
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-white/[0.06] border border-blue-200/60 dark:border-blue-800/40 px-3.5 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
            <ClipboardCheck className="h-3.5 w-3.5" /> {underReview.length} under review
          </div>
        </div>
      </div>

      {/* Vertically scrollable list */}
      {underReview.length > 0 ? (
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar space-y-4 pr-2 pb-6">
          {underReview.map((r) => (
            <ReviewCard key={r.id} request={r} />
          ))}
        </div>

        {/* Right column: Under Review */}
        <div>
          <SectionHeader
            label="Under Review"
            count={underReview.length}
            countBg="bg-blue-100 dark:bg-white/[0.06]"
            countColor="text-blue-700 dark:text-blue-300"
            icon={ClipboardCheck}
            iconBg="bg-blue-50 dark:bg-white/[0.06]"
            iconColor="text-blue-500"
          />
          {underReviewToShow.length > 0 ? (
            <>
              <div className="space-y-4">
                {underReviewToShow.map((r) => (
                  <RequestCardWithActions key={r.id} request={r} />
                ))}
              </div>
              {underReview.length > DISPLAY_LIMIT && (
                <div className="mt-4 flex justify-center">
                  <Link
                    href="/clerk/requests?status=under_review"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    View all under review ({underReview.length - DISPLAY_LIMIT} more)
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <EmptySection label="Under Review" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page (with Suspense) ─────────────────────────────────────────────────────
export default async function ClerkDashboardPage() {
  return (
    <Suspense fallback={<ClerkDashboardSkeleton />}>
      <ClerkDashboardContent />
    </Suspense>
  );
}
