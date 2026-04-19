//app/(dashboard)/clerk/page.tsx
import React from "react";
import { getRequestsForClerk } from "@/lib/queries/request.queries";
import { RequestCard } from "@/components/requests/request-card";
import { StatusUpdatePanel } from "@/components/clerk/status-update-panel";
import Link from 'next/link';

export default async function ClerkDashboardPage() {
  const { data: requests } = await getRequestsForClerk();

  const pending =
    requests?.filter((r) => r.status.status_name === "pending") ?? [];
  const underReview =
    requests?.filter((r) => r.status.status_name === "under_review") ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-200">Review Queue</h1>
        <p className="text-sm text-slate-500 mt-1">
          Requests awaiting review · oldest first (FIFO)
        </p>
      </div>

      {/* Pending section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-bold text-gray-200">Pending</h2>
          <span className="rounded-full bg-amber-900/40 px-2 py-0.5 text-xs font-bold text-amber-300">
            {pending.length}
          </span>
        </div>
        {pending.length > 0 ? (
          <div className="space-y-3">
            {pending.map((r) => (
              <React.Fragment key={r.id}>
                <RequestCard
                  key={r.id}
                  request={r}
                  href={`/clerk/requests/${r.id}`}
                />
                <StatusUpdatePanel
                  requestId={r.id}
                  currentStatus={r.status.status_name}
                  ticketNumber={r.ticket_number ?? ""}
                />
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No pending requests.</p>
        )}
      </section>

      {/* Under Review section */}
      {underReview.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
  <h2 className="text-lg font-bold text-gray-200">Under Review</h2>
  <span className="rounded-full bg-blue-900/40 px-2 py-0.5 text-xs font-bold text-blue-300">
    {underReview.length}
  </span>
</div>
          <div className="space-y-3">
            {underReview.map((r) => (
              <React.Fragment key={r.id}>
                <RequestCard
                  key={r.id}
                  request={r}
                  href={`/clerk/requests/${r.id}`}
                />
                <StatusUpdatePanel
                  requestId={r.id}
                  currentStatus={r.status.status_name}
                  ticketNumber={r.ticket_number ?? ""}
                />
              </React.Fragment>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
