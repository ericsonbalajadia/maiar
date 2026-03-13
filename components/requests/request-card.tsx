// components/ui/RequestCard.tsx
import Link from 'next/link';
import { StatusBadge } from '../ui/statusBadge';
import { PriorityBadge } from '../ui/priority-badge';
import type { RequestSummary } from '@/types/models';

interface Props {
  request: RequestSummary;
  href: string;
}

export function RequestCard({ request, href }: Props) {
  const date = new Date(request.created_at).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-teal-400 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-mono text-slate-400">
            {request.ticket_number}
          </p>
          <p className="mt-0.5 truncate font-semibold text-slate-800">
            {request.title}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {request.location.building_name} · {date}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge status={request.status.status_name} size="sm" />
          <PriorityBadge level={request.priority.level} />
        </div>
      </div>
    </Link>
  );
}