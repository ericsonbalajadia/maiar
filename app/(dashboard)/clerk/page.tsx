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
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
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
      <div className="border-t border-slate-100/80 dark:border-slate-800/60 px-4 py-3 bg-slate-50/40 dark:bg-slate-900/20 flex justify-start">
        <Button size="sm" asChild className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
          <Link href={`/clerk/requests/${request.id}/review`}>
            <Eye className="h-3.5 w-3.5" />
            Start Review
          </Link>
        </Button>
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
      </div>

      {/* Filter bar */}
      <div className="flex justify-between items-center">
        <ReviewQueueFilter currentType={typeFilter} />
        <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/40 px-3.5 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
          {underReview.length} request{underReview.length !== 1 ? "s" : ""} in review
        </div>
      </div>

      {/* Vertically scrollable list */}
      {underReview.length > 0 ? (
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar space-y-4 pr-2 pb-6">
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