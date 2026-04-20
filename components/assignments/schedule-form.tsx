//components/assignments/schedule-form.tsx
"use client";

import { useActionState, useTransition } from "react";
import { updateSchedule } from "@/actions/supervisor/schedule.actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  assignmentId: string;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  scheduleNotes?: string | null;
}

function toInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export function ScheduleForm({
  assignmentId,
  scheduledStart,
  scheduledEnd,
  scheduleNotes,
}: Props) {
  const [state, formAction] = useActionState(updateSchedule, {
    success: false,
  });
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Set Schedule</h3>
      {state.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-800">
          Schedule updated successfully.
        </div>
      )}
      {!state.success && state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-800">
          {state.error}
        </div>
      )}
      <form
        action={(fd) => startTransition(() => formAction(fd))}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date & Time
          </label>
          <Input
            type="datetime-local"
            name="scheduledStart"
            required
            defaultValue={toInputValue(scheduledStart)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date & Time
          </label>
          <Input
            type="datetime-local"
            name="scheduledEnd"
            required
            defaultValue={toInputValue(scheduledEnd)}
            className="w-full"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Schedule Notes (optional)
          </label>
          <Textarea
            name="scheduleNotes"
            rows={3}
            maxLength={500}
            defaultValue={scheduleNotes ?? ""}
            placeholder="e.g., Room will be vacated 8–10 AM"
            className="text-sm placeholder:text-gray-600"
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-700 text-white">
            {isPending
              ? "Saving..."
              : scheduledStart
                ? "Update Schedule"
                : "Set Schedule"}
          </Button>
        </div>
      </form>
    </div>
  );
}
