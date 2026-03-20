import { getRequestById } from '@/lib/queries/request.queries';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/requests/statusBadge';
import { PriorityBadge } from '@/components/requests/priority-badge';
import { StatusTimeline } from '@/components/requests/status-timeline';
import { RequestDetailRealtime } from '@/components/requests/request-detail';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RequesterRequestDetailPage({ params }: Props) {
  const { id } = await params;
  const { data: request } = await getRequestById(id);
  if (!request) notFound();

  const supabase = await createClient();
  const { data: history } = await supabase
    .from('status_history')
    .select(
      `
      *,
      old_status:statuses!old_status_id(status_name),
      new_status:statuses!new_status_id(status_name),
      changed_by_user:users!changed_by(full_name)
    `
    )
    .eq('request_id', id)
    .order('changed_at', { ascending: true });

  const isCompleted = request.status.status_name === 'completed';

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400">
        <Link href="/requester/requests" className="hover:text-teal-600">
          My Requests
        </Link>
        <span className="mx-2">›</span>
        <span className="text-slate-600">{request.ticket_number}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-slate-400">{request.ticket_number}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">{request.title}</h1>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <RequestDetailRealtime
            requestId={request.id}
            initialStatus={request.status.status_name}
          />
          <PriorityBadge level={request.priority.level} />
        </div>
      </div>

      {/* Details card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 text-sm shadow-sm">
        <p>
          <span className="font-medium text-slate-500">Location:</span>{' '}
          {request.location.building_name}
          {request.location.room_number && (
            <span className="text-slate-400"> – Room {request.location.room_number}</span>
          )}
        </p>
        <p>
          <span className="font-medium text-slate-500">Type:</span>{' '}
          {request.request_type === 'rmr'
            ? 'FM-GSO-09 Repair & Maintenance'
            : 'FM-GSO-15 Physical Plant Service'}
        </p>
        {request.category && (
          <p>
            <span className="font-medium text-slate-500">Category:</span>{' '}
            {request.category.category_name}
          </p>
        )}
        <p>
          <span className="font-medium text-slate-500">Submitted:</span>{' '}
          {new Date(request.created_at).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <div className="pt-2 border-t border-slate-100">
          <p className="font-medium text-slate-500 mb-1">Description</p>
          <p className="text-slate-700 whitespace-pre-wrap">{request.description}</p>
        </div>
      </div>

      {/* Status timeline */}
      {history && history.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-3">Status History</h2>
          <StatusTimeline history={history as any} />
        </section>
      )}

      {/* Feedback link – only when completed */}
      {isCompleted && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm">
          <p className="font-medium text-teal-800">This request has been completed.</p>
          <Link
            href={`/requester/requests/${id}/feedback`}
            className="mt-2 inline-block text-sm font-medium text-teal-700 hover:underline"
          >
            Leave feedback →
          </Link>
        </div>
      )}
    </div>
  );
}