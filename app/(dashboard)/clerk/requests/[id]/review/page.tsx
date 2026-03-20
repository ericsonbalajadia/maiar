import { getRequestById } from '@/lib/queries/request.queries';
import { startReview } from '@/actions/review.actions';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/requests/statusBadge';
import { ReviewForm } from '@/components/reviews/review-form';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClerkReviewPage({ params }: Props) {
  const { id } = await params;
  const { data: request } = await getRequestById(id);
  if (!request) notFound();

  // Idempotent transition pending → under_review
  if (request.status.status_name === 'pending') {
    await startReview(id);
  }

  const isReviewable = ['pending', 'under_review'].includes(request.status.status_name);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400">
        <Link href="/clerk" className="hover:text-teal-600">
          Review Queue
        </Link>
        <span className="mx-2">›</span>
        <span className="text-slate-600">{request.ticket_number}</span>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-slate-400">{request.ticket_number}</p>
          <h1 className="mt-1 text-xl font-bold text-slate-800">{request.title}</h1>
        </div>
        <StatusBadge status={request.status.status_name} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm space-y-3">
        <p>
          <span className="font-medium text-slate-500">Requester:</span>{' '}
          {request.requester.full_name}
        </p>
        <p>
          <span className="font-medium text-slate-500">Location:</span>{' '}
          {request.location.building_name}
        </p>
        <div className="pt-2 border-t border-slate-100">
          <p className="font-medium text-slate-500 mb-1">Description</p>
          <p className="text-slate-700 whitespace-pre-wrap">{request.description}</p>
        </div>
      </div>

      {isReviewable ? (
        <ReviewForm requestId={id} />
      ) : (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          Already reviewed – status: {request.status.status_name}
        </p>
      )}
    </div>
  );
}