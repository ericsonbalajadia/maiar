//app/(dashboard)/supervisor/requests/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRequestById } from "@/lib/queries/request.queries";
import { getAvailableTechnicians } from "@/lib/queries/technician.queries";
import { SupervisorStatusPanel } from "@/components/supervisor/supervisor-status-panel";
import { AssignTechnicianForm } from "@/components/assignments/assign-technician-form";
import { RequestDetailPanel } from "@/components/clerk/request-detail-panel";
import { ScheduleForm } from "@/components/assignments/schedule-form";
import { FeedbackPanel } from "@/components/feedback/feedback-panel";
import { AttachmentPreview } from "@/components/requests/attachment-preview";
import { Paperclip } from "lucide-react";
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

  // Fetch request data (includes attachments, assignments, status, etc.)
  const { data: request, error } = await getRequestById(id);
  if (error || !request) return notFound();

  const technicians = await getAvailableTechnicians();

  // Find active assignment (not completed)
  const assignments = request.request_assignments ?? [];
  const activeAssignment = assignments.find((a: any) => !a.completed_at);
  const hasSchedule = activeAssignment?.scheduled_start != null;
  const currentTechnicianId = activeAssignment?.technician?.id ?? null;
  const currentStatus = request.statuses?.status_name ?? "";
  const canAssign = ["approved", "assigned"].includes(currentStatus);
  const showStatusPanel =
    ["assigned", "in_progress"].includes(currentStatus) && hasSchedule;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Request Detail</h1>
        <Link href="/supervisor">
          <Button variant="outline" size="sm">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Request details (read-only) */}
      <RequestDetailPanel request={request} hideStatusPanel={true} />

      {/* Assign technician – only for approved/assigned */}
      {canAssign && (
        <AssignTechnicianForm
          key={`assign-form-${currentTechnicianId || "none"}`}
          requestId={id}
          technicians={technicians}
          currentAssignedId={currentTechnicianId}
          ticketNumber={request.ticket_number}
        />
      )}

      {/* Schedule form – only if an active assignment exists */}
      {activeAssignment && (
        <div className="rounded-lg border p-4 text-sm">
          <ScheduleForm
            assignmentId={activeAssignment.id}
            scheduledStart={activeAssignment.scheduled_start}
            scheduledEnd={activeAssignment.scheduled_end}
            scheduleNotes={activeAssignment.schedule_notes}
          />
        </div>
      )}

      {/* Attachments – always show, with conditional content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-slate-400" />
          Attachments
        </h3>
        {!request.attachments || request.attachments.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No attachments uploaded.</p>
        ) : (
          <AttachmentPreview
            attachments={request.attachments}
            requestId={id}
            canDelete={false}
          />
        )}
      </div>

      {/* Feedback Panel – only when request is completed */}
      {currentStatus === "completed" && (
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
            Requester Feedback
          </h2>
          <FeedbackPanel requestId={id} />
        </div>
      )}

      {/* Supervisor status update panel – only when schedule set & status allows */}
      {showStatusPanel && (
        <div className="rounded-lg border p-6 shadow-sm">
          <SupervisorStatusPanel requestId={id} currentStatus={currentStatus} />
        </div>
      )}
    </div>
  );
}