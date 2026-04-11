//app/(dashboard)/supervisor/requests/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRequestById } from "@/lib/queries/request.queries";
import { getAvailableTechnicians } from "@/lib/queries/technician.queries";
import { AssignTechnicianForm } from "@/components/assignments/assign-technician-form";
import { RequestDetailPanel } from "@/components/clerk/request-detail-panel";
import { ScheduleForm } from "@/components/assignments/schedule-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SupervisorRequestDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Use the existing query that already returns properly shaped data
  const { data: request, error } = await getRequestById(id);
  if (error || !request) return notFound();

  const technicians = await getAvailableTechnicians();

  // Find active assignment from the request_assignments relation
  const assignments = request.request_assignments ?? [];
  const activeAssignment = assignments.find((a: any) => !a.completed_at);
  const currentTechnicianId = activeAssignment?.technician?.id ?? null;
  const currentStatus = request.statuses?.status_name ?? "";
  const canAssign = ["approved", "assigned"].includes(currentStatus);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          Request Detail -- {request.ticket_number}
        </h1>
        <Link href="/supervisor">
          <Button variant="outline" size="sm">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      <RequestDetailPanel request={request} hideStatusPanel={true} />

      {canAssign && (
        <AssignTechnicianForm
          requestId={id}
          technicians={technicians}
          currentAssignedId={currentTechnicianId}
          ticketNumber={request.ticket_number}
        />
      )}

      {activeAssignment && (
        <div className="rounded-lg border p-4 text-sm">
          {activeAssignment && (
              <ScheduleForm
                assignmentId={activeAssignment.id}
                scheduledStart={activeAssignment.scheduled_start}
                scheduledEnd={activeAssignment.scheduled_end}
                scheduleNotes={activeAssignment.schedule_notes}
              />
          )}
        </div>
      )}
    </div>
  );
}
