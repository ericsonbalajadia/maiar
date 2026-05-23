import React, { Suspense } from "react";
import Link from "next/link";
import { Eye, InboxIcon } from "lucide-react";
import { getRequestsForClerk } from "@/lib/queries/request.queries";
import { RequestCard } from "@/components/requests/request-card";
import { StatusUpdatePanel } from "@/components/clerk/status-update-panel";
import { ClerkDashboardSkeleton } from "./skeleton";
import { ReviewQueueFilter } from "@/components/clerk/review-queue-filter";

function EmptySection() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-10 text-center dark:border-slate-700/60">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05]">
        <InboxIcon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        No requests in review
      </p>
      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
        All caught up.
      </p>
    </div>
  );
}

function ReviewCard({ request }: { request: any }) {
  return (
    <div
      className="relative z-0 overflow-hidden rounded-2xl border border-white/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/60"
      style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)" }}
    >
      <RequestCard request={request} fullHref={`/clerk/requests/${request.id}/review`} />
      <div className="border-t border-slate-100/80 bg-slate-50/40 px-4 py-3 dark:border-slate-800/60 dark:bg-white/[0.04]">
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

async function ClerkDashboardContent({ searchParams }: Props) {
  const sp = await searchParams;
  const typeFilter = sp.type === "rmr" || sp.type === "ppsr" ? sp.type : "all";

  const { data: requests } = await getRequestsForClerk();
  let underReview = requests?.filter((r) => r.status.status_name === "under_review") ?? [];

  if (typeFilter !== "all") {
    underReview = underReview.filter((r) => r.request_type === typeFilter);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6 fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400">
            Clerk - Review Queue
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Review Queue</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Requests ready for review, oldest first
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

      <div className="flex flex-col gap-3 rounded-2xl border border-white/60 p-4 dark:border-slate-700/60 md:flex-row md:items-center md:justify-between">
        <ReviewQueueFilter currentType={typeFilter} />
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-200/60 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 dark:border-blue-800/40 dark:bg-white/[0.06] dark:text-blue-300">
          {underReview.length} under review
        </div>
      </div>

      {underReview.length > 0 ? (
        <div className="max-h-[calc(100vh-280px)] space-y-4 overflow-y-auto pr-2 pb-6 custom-scrollbar">
          {underReview.map((r) => (
            <ReviewCard key={r.id} request={r} />
          ))}
        </div>
      ) : (
        <EmptySection />
      )}
    </div>
  );
}

export default async function ClerkDashboardPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<ClerkDashboardSkeleton />}>
      <ClerkDashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
