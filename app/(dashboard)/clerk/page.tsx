import { getRequestsForClerk } from '@/lib/queries/request.queries';
import { RequestCard } from '@/components/requests/request-card';
import { StatusUpdatePanel } from '@/components/clerk/status-update-panel';

export default async function ClerkDashboardPage() {
  const { data: requests } = await getRequestsForClerk();

  const pending = requests?.filter((r) => r.status.status_name === 'pending') ?? [];
  const underReview = requests?.filter((r) => r.status.status_name === 'under_review') ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Review Queue</h1>
        <p className="text-sm text-slate-500 mt-1">
          Requests awaiting review · oldest first (FIFO)
        </p>
      </div>

      {/* Pending section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-slate-700">Pending</h2>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
            {pending.length}
          </span>
        </div>
        {pending.length > 0 ? (
          <div className="space-y-3">
            {pending.map((r) => (
              <>
              <RequestCard
                key={r.id}
                request={r}
                href={`/clerk/requests/${r.id}/review`}
              />
              <StatusUpdatePanel
                  requestId={r.id}
                  currentStatus={r.status.status_name}
                  ticketNumber={r.ticket_number ?? ''}
                />
              </>
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
            <h2 className="text-base font-semibold text-slate-700">Under Review</h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
              {underReview.length}
            </span>
          </div>
          <div className="space-y-3">
            {underReview.map((r) => (
              <>
              <RequestCard
                key={r.id}
                request={r}
                href={`/clerk/requests/${r.id}/review`}
              />
              <StatusUpdatePanel
                  requestId={r.id}
                  currentStatus={r.status.status_name}
                  ticketNumber={r.ticket_number ?? ''}
                />
              </>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}