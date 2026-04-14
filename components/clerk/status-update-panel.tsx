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

interface StatusUpdatePanelProps {
  requestId: string;
  currentStatus: string;
  ticketNumber: string;
}

const LABEL: Record<string, string> = {
  under_review: "Start Review",
  approved: "Approve",
  rejected: "Reject",
  cancelled: "Cancel Request",
};

const VARIANT: Record<
  string,
  "default" | "destructive" | "outline" | "secondary"
> = {
  under_review: "secondary",
  approved: "default",
  rejected: "destructive",
  cancelled: "destructive",
};

export function StatusUpdatePanel({
  requestId,
  currentStatus,
  ticketNumber,
}: StatusUpdatePanelProps) {
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allowedTargets = CLERK_ALLOWED_TRANSITIONS[currentStatus] ?? [];
  if (allowedTargets.length === 0) return null;

  function handleAction(newStatus: string) {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateRequestStatusByClerk(
        requestId,
        newStatus,
        notes,
      );
      if (result?.error) {
        setFeedback(`Error: ${result.error}`);
      } else {
        setFeedback(`Status updated to ${result.newStatus}.`);
        setNotes("");
      }
    });
  }

  const requiresNotes = allowedTargets.some((s) =>
    CLERK_NOTES_REQUIRED.includes(s),
  );

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <p className="text-sm font-semibold text-muted-foreground">
        Status Actions — <span className="font-mono">{ticketNumber}</span>
      </p>

      {requiresNotes && (
        <Textarea
          placeholder="Notes / reason (required for reject or cancel)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="text-sm placeholder:text-gray-600"
          rows={3}
        />
      )}

      <div className="flex flex-wrap gap-2">
        {allowedTargets.map((target) => (
          <Button
            key={target}
            variant={VARIANT[target] ?? "outline"}
            size="sm"
            disabled={isPending}
            onClick={() => handleAction(target)}
          >
            {LABEL[target] ?? target}
          </Button>
        ))}
      </div>

      {feedback && (
        <div
          className={`mt-3 text-xs ${
            feedback.startsWith("Error") ? "text-red-500" : "text-green-600"
          }`}
        >
          {feedback}
        </div>
      )}
    </div>
  );
}
