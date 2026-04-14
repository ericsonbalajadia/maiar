// components/assignments/assign-technician-form.tsx
"use client";

import { useActionState, useTransition } from "react";
import { assignTechnician } from "@/actions/supervisor/assignment.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // shadcn textarea
import type { AvailableTechnician } from "@/lib/queries/technician.queries";

interface Props {
  requestId: string;
  technicians: AvailableTechnician[];
  currentAssignedId?: string | null;
  ticketNumber: string;
}

export function AssignTechnicianForm({
  requestId,
  technicians,
  currentAssignedId,
  ticketNumber,
}: Props) {
  const [state, formAction] = useActionState(assignTechnician, {
    success: false,
  });
  const [isPending, startTransition] = useTransition();

  const sorted = [...technicians].sort(
    (a, b) => a.active_assignments - b.active_assignments,
  );

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <p className="text-sm font-semibold text-muted-foreground">
        Assign Technician — <span className="font-mono">{ticketNumber}</span>
      </p>

      {state.success && (
        <div className="text-xs text-green-600">
          ✓ Technician assigned successfully.
        </div>
      )}
      {!state.success && state.error && (
        <div className="text-xs text-red-500">Error: {state.error}</div>
      )}

      <form
        action={(fd) => startTransition(() => formAction(fd))}
        className="space-y-3"
      >
        <input type="hidden" name="requestId" value={requestId} />

        <div>
          <label
            htmlFor="technicianId"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Technician
          </label>
          <select
            name="technicianId"
            id="technicianId"
            required
            defaultValue={currentAssignedId ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">-- Choose a technician --</option>
            {sorted.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
                {t.specialization ? ` (${t.specialization})` : ""}
                {` — ${t.active_assignments} active`}
                {!t.is_available ? " [unavailable]" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Assignment Notes{" "}
            <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={500}
            placeholder="e.g., Check circuit breaker first, bring replacement bulbs"
            className="text-sm placeholder:text-gray-600"
          />
        </div>

        <div className="sm:col-span-2">
          <Button
            type="submit"
            disabled={isPending}
            variant="default"
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isPending
              ? "Assigning..."
              : currentAssignedId
                ? "Reassign Technician"
                : "Assign Technician"}
          </Button>
        </div>
      </form>
    </div>
  );
}
