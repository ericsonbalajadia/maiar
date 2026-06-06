import React, { Suspense } from "react";
import Link from "next/link";
import { Eye, InboxIcon } from "lucide-react";
import { getRequestsForClerk } from "@/lib/queries/request.queries";
import { RequestCard } from "@/components/requests/request-card";
import { ClerkDashboardSkeleton } from "./skeleton";
import { ReviewQueueFilter } from "@/components/clerk/review-queue-filter";
import { Button } from "@/components/ui/button";

function EmptySection() {
  return (
    <div className="clerk-surface flex flex-col items-center justify-center rounded-2xl border-dashed py-10 text-center">
      <div className="clerk-tile mb-3 flex h-10 w-10 items-center justify-center rounded-xl">
        <InboxIcon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        No requests match the filters
      </p>
      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
        Try changing the type or status filter.
      </p>
    </div>
  );
}

function ReviewCard({ request }: { request: any }) {
  return (
    <div className="clerk-surface relative z-0 overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <RequestCard request={request} fullHref={`/clerk/requests/${request.id}/review`} />
      <div className="border-t border-[#58855C]/20 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
        <Button
          size="sm"
          asChild
          className="gap-1.5 bg-[#58855C] hover:bg-[#6f9873] text-white shadow-sm"
        >
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

async function ClerkDashboardContent({ searchParams }: Props) {
  const sp = await searchParams;
  const typeFilter = sp.type === "rmr" || sp.type === "ppsr" ? sp.type : "all";

  const { data: requests } = await getRequestsForClerk();
  let filtered = requests ?? [];

  // Apply type filter only (no status filter)
  if (typeFilter !== "all") {
    filtered = filtered.filter((r) => r.request_type === typeFilter);
  }

  return (
    <div className="clerk-shell mx-auto max-w-7xl space-y-6 px-4 md:px-6 fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#58855C] dark:text-emerald-300">
            Clerk · Review Queue
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Review Queue
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            All requests ready for processing
          </p>
        </div>
        <Link
          href="/clerk/requests"
          className="clerk-button inline-flex items-center gap-2 self-start rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors"
        >
          View All Requests
          <Eye className="h-4 w-4" />
        </Link>
      </div>

      <div className="clerk-surface-soft flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
        <ReviewQueueFilter currentType={typeFilter} />
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#58855C]/25 bg-[#58855C]/10 px-3.5 py-2 text-sm font-semibold text-[#58855C] dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-300">
          <span className="font-semibold">{filtered.length}</span>
          total request{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="max-h-[calc(100vh-280px)] space-y-4 overflow-y-auto pr-2 pb-6 custom-scrollbar">
          {filtered.map((r) => (
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