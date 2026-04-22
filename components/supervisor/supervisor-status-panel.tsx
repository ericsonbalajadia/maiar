//app/(dashboard)/supervisor/requests/[id]/verify/page.tsx
'use client';

import { useActionState, useTransition } from 'react';
import { updateRequestStatusBySupervisor } from '@/actions/supervisor/supervisor-status.actions';
import { SUPERVISOR_ALLOWED_TRANSITIONS, SUPERVISOR_NOTES_REQUIRED } from '@/lib/constants/statuses';
import { Textarea } from "@/components/ui/textarea";
import { Button } from '@/components/ui/button';

interface Props {
  requestId: string;
  currentStatus: string;
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: 'Mark In Progress',
  completed: 'Mark Completed',
  cancelled: 'Cancel Request',
};

const STATUS_STYLES: Record<string, string> = {
  in_progress: 'bg-blue-600 hover:bg-blue-700 text-white',
  completed: 'bg-green-600 hover:bg-green-700 text-white',
  cancelled: 'bg-red-600 hover:bg-red-700 text-white',
};

export function SupervisorStatusPanel({ requestId, currentStatus }: Props) {
  // Normalize status to lowercase for consistent lookup
  const normalizedStatus = currentStatus?.toLowerCase() ?? '';
  
  // Get allowed transitions and filter out the current status itself (safety)
  const allowedNext = (SUPERVISOR_ALLOWED_TRANSITIONS[normalizedStatus] ?? [])
    .filter(next => next !== normalizedStatus);

  // Debug logs (remove in production)
  console.log('[SupervisorStatusPanel] Received:', currentStatus, 'Normalized:', normalizedStatus);
  console.log('[SupervisorStatusPanel] Allowed transitions:', allowedNext);

  const [state, formAction] = useActionState(updateRequestStatusBySupervisor, { success: false });
  const [isPending, startTransition] = useTransition();

  if (allowedNext.length === 0) {
    return (
      <div className="rounded-md bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-500">
        No further status updates available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">
        Update Status
        <span className="ml-2 text-xs font-normal text-gray-500">
          (on behalf of assigned technician)
        </span>
      </h3>
      {state.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-800">
          Status updated successfully.
        </div>
      )}
      {!state.success && state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-800">
          {state.error}
        </div>
      )}
      <div className="space-y-3">
        {allowedNext.map((nextStatus) => {
          const needsNotes = SUPERVISOR_NOTES_REQUIRED.includes(nextStatus);
          return (
            <form
              key={nextStatus}
              action={(fd) => startTransition(() => formAction(fd))}
              className="space-y-2"
            >
              <input type="hidden" name="requestId" value={requestId} />
              <input type="hidden" name="newStatus" value={nextStatus} />
              {needsNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (required for {nextStatus})
                  </label>
                  <Textarea
                    name="notes"
                    required
                    rows={2}
                    maxLength={500}
                    placeholder="Reason for cancellation..."
                    className="text-sm placeholder:text-gray-600"
                  />
                </div>
              )}
              <Button
                type="submit"
                disabled={isPending}
                className={STATUS_STYLES[nextStatus] ?? ''}
              >
                {isPending ? 'Updating...' : (STATUS_LABELS[nextStatus] ?? nextStatus)}
              </Button>
            </form>
          );
        })}
      </div>
    </div>
  );
}