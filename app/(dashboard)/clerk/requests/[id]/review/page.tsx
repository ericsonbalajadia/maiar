//app/(dashboard)/clerk/requests/[id]/review/page.tsx

import { getRequestById } from '@/lib/queries/request.queries';
import { startReview } from '@/actions/review.actions';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/requests/statusBadge';
import { ReviewForm } from '@/components/reviews/review-form';
import { fetchStatusHistory } from '@/lib/actions/tracking';
import { RequestTimeline } from '@/components/tracking/requestTimeline';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClerkReviewPage({ params }: Props) {
  const { id } = await params;
  const { data: request } = await getRequestById(id);
  if (!request) notFound();

  const history = await fetchStatusHistory(id);

  // ✅ Defensive: handle missing status
  const currentStatus = request.statuses?.status_name ?? 'pending';
  const isReviewable = ['pending', 'under_review'].includes(currentStatus);

  // ✅ Defensive: handle missing location
  const buildingName = request.locations?.building_name ?? 'Unknown location';

  if (currentStatus === 'pending') {
    await startReview(id);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400">
        <Link href="/clerk" className="hover:text-teal-600">Review Queue</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-600">{request.ticket_number}</span>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-slate-400">{request.ticket_number}</p>
          <h1 className="mt-1 text-xl font-bold text-slate-800">{request.title}</h1>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm space-y-3">
        <p>
          <span className="font-medium text-slate-500">Requester:</span>{' '}
          {request.requester?.full_name ?? 'Unknown'}
        </p>
        <p>
          <span className="font-medium text-slate-500">Location:</span>{' '}
          {buildingName}
        </p>
        <div className="pt-2 border-t border-slate-100">
          <p className="font-medium text-slate-500 mb-1">Description</p>
          <p className="text-slate-700 whitespace-pre-wrap">{request.description ?? 'No description provided.'}</p>
        </div>
      </div>

      {/* Status History Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Status History</h3>
        <RequestTimeline history={history} />
      </div>

      {isReviewable ? (
        <ReviewForm requestId={id} />
      ) : (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          Already reviewed – status: {currentStatus}
        </p>
      )}
    </div>
  );
}