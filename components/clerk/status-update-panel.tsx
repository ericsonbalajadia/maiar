// components/clerk/status-update-panel.tsx
"use client";

import { useState, useTransition } from "react";
import { updateRequestStatusByClerk } from "@/actions/clerk/clerk-status.actions";
import {
  CLERK_ALLOWED_TRANSITIONS,
  CLERK_NOTES_REQUIRED,
} from "@/lib/constants/statuses";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2, XCircle, Clock, AlertCircle, Loader2, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusUpdatePanelProps {
  requestId: string;
  currentStatus: string;
  ticketNumber: string;
}

// ─── Button config per transition target ──────────────────────────────────────

const TRANSITION_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  under_review: {
    label: "Start Review",
    icon: Clock,
    className:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 border-0",
  },
  approved: {
    label: "Approve",
    icon: CheckCircle2,
    className:
      "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm shadow-emerald-500/20 border-0",
  },
  rejected: {
    label: "Reject",
    icon: XCircle,
    className:
      "bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20",
  },
  cancelled: {
    label: "Cancel",
    icon: XCircle,
    className:
      "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function StatusUpdatePanel({
  requestId,
  currentStatus,
  ticketNumber,
}: StatusUpdatePanelProps) {
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeTarget, setActiveTarget] = useState<string | null>(null);

  const allowedTargets = CLERK_ALLOWED_TRANSITIONS[currentStatus] ?? [];
  if (allowedTargets.length === 0) return null;

  const requiresNotes = allowedTargets.some((s) =>
    CLERK_NOTES_REQUIRED.includes(s)
  );

  function handleAction(newStatus: string) {
    setFeedback(null);
    setActiveTarget(newStatus);
    startTransition(async () => {
      const result = await updateRequestStatusByClerk(requestId, newStatus, notes);
      setActiveTarget(null);
      if (result?.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({
          type: "success",
          message: `Status updated to "${result.newStatus?.replace(/_/g, " ")}".`,
        });
        setNotes("");
      }
    });
  }

  return (
    <div className="space-y-3">
      {/* Notes textarea (only when at least one target requires notes) */}
      {requiresNotes && (
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5 block">
            Notes / Reason
            <span className="text-rose-400 ml-0.5">*</span>
            <span className="text-slate-300 dark:text-slate-600 font-normal ml-1">
              (required for reject / cancel)
            </span>
          </label>
          <Textarea
            placeholder="Provide a reason for this decision…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none text-sm bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition-all placeholder:text-slate-400"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {allowedTargets.map((target) => {
          const config = TRANSITION_CONFIG[target];
          const Icon = config?.icon ?? ChevronRight;
          const isThisLoading = isPending && activeTarget === target;

          return (
            <Button
              key={target}
              size="sm"
              disabled={isPending}
              onClick={() => handleAction(target)}
              className={cn(
                "h-8 px-3 gap-1.5 text-xs font-semibold transition-all",
                config?.className ?? "bg-slate-100 text-slate-700"
              )}
            >
              {isThisLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              {isThisLoading ? "Updating…" : (config?.label ?? target)}
            </Button>
          );
        })}
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all",
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}
    </div>
  );
}