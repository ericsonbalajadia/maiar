// components/request/RequestTimeline.tsx
import { format } from 'date-fns';

interface StatusHistoryEntry {
  id: string;
  changed_at: string;
  change_reason?: string | null;
  old_status?: { status_name: string } | null;
  new_status: { status_name: string };
  changed_by_user?: { full_name: string } | null;
}

interface Props {
  history: StatusHistoryEntry[];
}

export function RequestTimeline({ history }: Props) {
  if (!history.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
        No status history available.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((entry, idx) => {
          const isLast = idx === history.length - 1;
          const date = new Date(entry.changed_at);
          const formattedDate = format(date, 'MMM d, yyyy');
          const formattedTime = format(date, 'h:mm a');

          return (
            <li key={entry.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 ring-1 ring-teal-200">
                    <div className="h-2 w-2 rounded-full bg-teal-600" />
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-slate-700">
                        <span className="font-medium capitalize">
                          {entry.new_status.status_name.replace(/_/g, ' ')}
                        </span>
                        {entry.old_status && (
                          <span className="text-slate-500">
                            {' '}
                            (was {entry.old_status.status_name.replace(/_/g, ' ')})
                          </span>
                        )}
                      </p>
                      {entry.change_reason && (
                        <p className="mt-0.5 text-xs text-slate-500 italic">
                          "{entry.change_reason}"
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-400">
                        by {entry.changed_by_user?.full_name ?? 'System'}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-xs text-slate-500">
                      <time dateTime={entry.changed_at}>
                        {formattedDate}
                        <br />
                        {formattedTime}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}