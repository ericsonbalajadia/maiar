"use client";

import { useActionState, useTransition } from "react";
import { updateRequestStatusBySupervisor } from "@/actions/supervisor/supervisor-status.actions";
import {
  SUPERVISOR_ALLOWED_TRANSITIONS,
  SUPERVISOR_NOTES_REQUIRED,
} from "@/lib/constants/statuses";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Zap, CheckCircle2, XCircle, Loader2, CheckCheck, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  requestId: string;
  currentStatus: string;
}

// ─── Transition button config (unchanged) ─────────────────────────────────────

const TRANSITION_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  in_progress: {
    label: "Mark In Progress",
    icon: Zap,
    className:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/20 border-0",
  },
  completed: {
    label: "Mark Completed",
    icon: CheckCircle2,
    className:
      "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm shadow-emerald-500/20 border-0",
  },
  cancelled: {
    label: "Cancel Request",
    icon: XCircle,
    className:
      "bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SupervisorStatusPanel({ requestId, currentStatus }: Props) {
  const normalizedStatus = currentStatus?.toLowerCase() ?? "";
  const allowedNext = (SUPERVISOR_ALLOWED_TRANSITIONS[normalizedStatus] ?? []).filter(
    (next) => next !== normalizedStatus
  );

  const [state, formAction] = useActionState(updateRequestStatusBySupervisor, {
    success: false,
  });
  const [isPending, startTransition] = useTransition();

  if (allowedNext.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 px-4 py-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
          <CheckCheck className="h-4 w-4 text-emerald-500" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No further status updates available for this request.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success feedback */}
      {state.success && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Status updated successfully.
        </div>
      )}

      {/* Error feedback */}
      {!state.success && state.error && (
        <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      {/* One form per transition target */}
      <div className="space-y-3">
        {allowedNext.map((nextStatus) => {
          const needsNotes = SUPERVISOR_NOTES_REQUIRED.includes(nextStatus);
          const config = TRANSITION_CONFIG[nextStatus];
          const Icon = config?.icon ?? Zap;

          return (
            <form
              key={nextStatus}
              action={(fd) => startTransition(() => formAction(fd))}
              className="space-y-2.5"
            >
              <input type="hidden" name="requestId" value={requestId} />
              <input type="hidden" name="newStatus" value={nextStatus} />

              {needsNotes && (
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5 block">
                    Notes
                    <span className="text-rose-400 ml-0.5">*</span>
                    <span className="text-slate-300 dark:text-slate-600 font-normal ml-1">
                      (required for cancellation)
                    </span>
                  </label>
                  <Textarea
                    name="notes"
                    required
                    rows={2}
                    maxLength={500}
                    placeholder="Reason for cancellation…"
                    className="text-sm placeholder:text-gray-600"
                  />
                </div>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className={cn(
                  "h-9 px-4 gap-2 text-xs font-semibold transition-all",
                  config?.className ??
                    "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                )}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
                {isPending ? "Updating…" : config?.label ?? nextStatus}
              </Button>
            </form>
          );
        })}
      </div>
    </div>
  );
}