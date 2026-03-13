// components/requests/status-timeline.tsx
import { format } from 'date-fns';

interface StatusHistoryEntry {
  id: string;
  changed_at: string;
  old_status: { status_name: string } | null;
  new_status: { status_name: string };
  changed_by_user: { full_name: string } | null;
}

interface Props {
  history: StatusHistoryEntry[];
}

export function StatusTimeline({ history }: Props) {
  return (
    <div className="space-y-3">
      {history.map((entry, index) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-teal-500 mt-1" />
            {index < history.length - 1 && (
              <div className="w-0.5 h-full bg-slate-200 mt-1" />
            )}
          </div>
          <div className="pb-4 flex-1">
            <p className="text-sm font-medium capitalize">
              {entry.new_status.status_name.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-slate-500">
              {entry.changed_by_user?.full_name ?? 'System'} ·{' '}
              {format(new Date(entry.changed_at), 'MMM d, yyyy h:mm a')}
            </p>
            {entry.old_status && (
              <p className="text-xs text-slate-400 mt-1">
                from {entry.old_status.status_name.replace(/_/g, ' ')}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}