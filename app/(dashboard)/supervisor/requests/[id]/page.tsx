// app/(dashboard)/supervisor/requests/[id]/page.tsx
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
import {
  Paperclip,
  ChevronLeft,
  Wrench,
  Calendar,
  Star,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

// ─── Glass section wrapper ────────────────────────────────────────────────────

function GlassSection({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-white/60 dark:border-slate-700/60 overflow-hidden shadow-sm"
      style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)" }}
    >
      {children}
    </div>
  );
}

function GlassSectionHeader({
  icon: Icon,
  iconGradient,
  title,
  badge,
}: {
  icon: React.ElementType;
  iconGradient: string;
  title: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100/80 dark:border-slate-800/60 bg-white/30 dark:bg-slate-900/30">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${iconGradient}`}
      >
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-white flex-1">
        {title}
      </h3>
      {badge}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SupervisorRequestDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: request, error } = await getRequestById(id);
  if (error || !request) return notFound();

  const technicians = await getAvailableTechnicians();

  const assignments = request.request_assignments ?? [];
  const activeAssignment = assignments.find((a: any) => !a.completed_at);
  const hasSchedule = activeAssignment?.scheduled_start != null;
  const currentTechnicianId = activeAssignment?.technician?.id ?? null;
  const currentStatus = request.statuses?.status_name ?? "";
  const canAssign = ["approved", "assigned"].includes(currentStatus);
  const showStatusPanel =
    ["assigned", "in_progress"].includes(currentStatus) && hasSchedule;
  const isCompleted = currentStatus === "completed";
  const ticketNumber = request.ticket_number ?? id.slice(0, 8).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <Link
          href="/supervisor"
          className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Dashboard
        </Link>
        <span>/</span>
        <Link
          href="/supervisor/requests"
          className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          All Requests
        </Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-300 font-mono font-medium">
          {ticketNumber}
        </span>
      </div>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1">
            Request Detail
          </p>
          {/* <h1 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2">
            {request.title}
          </h1> */}
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0"
        >
          {/* <Link href="/supervisor">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link> */}
        </Button>
      </div>

      {/* ── 1. Request details (read-only) ── */}
      <GlassSection>
        <div className="px-6 py-5">
          <RequestDetailPanel
            request={request}
            hideStatusPanel={true}
            variant="plain"
          />
        </div>
      </GlassSection>

      {/* ── 2. Assign technician ── */}
      {canAssign && (
        <GlassSection>
          <GlassSectionHeader
            icon={Wrench}
            iconGradient="bg-gradient-to-br from-violet-500 to-purple-600"
            title="Assign Technician"
            badge={
              currentTechnicianId ? (
                <span className="text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/50">
                  Reassign
                </span>
              ) : (
                <span className="text-[11px] font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/50">
                  Required
                </span>
              )
            }
          />
          <div className="p-5">
            <AssignTechnicianForm
              key={`assign-form-${currentTechnicianId ?? "none"}`}
              requestId={id}
              technicians={technicians}
              currentAssignedId={currentTechnicianId}
              ticketNumber={request.ticket_number}
            />
          </div>
        </GlassSection>
      )}

      {/* ── 3. Schedule form ── */}
      {activeAssignment && (
        <GlassSection>
          <GlassSectionHeader
            icon={Calendar}
            iconGradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            title="Repair Schedule"
            badge={
              hasSchedule ? (
                <span className="text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                  Scheduled
                </span>
              ) : (
                <span className="text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50">
                  Not set
                </span>
              )
            }
          />
          <div className="p-5">
            <ScheduleForm
              assignmentId={activeAssignment.id}
              scheduledStart={activeAssignment.scheduled_start}
              scheduledEnd={activeAssignment.scheduled_end}
              scheduleNotes={activeAssignment.schedule_notes}
            />
          </div>
        </GlassSection>
      )}

      {/* ── 4. Attachments ── */}
      <GlassSection>
        <GlassSectionHeader
          icon={Paperclip}
          iconGradient="bg-gradient-to-br from-slate-500 to-slate-700"
          title="Attachments"
          badge={
            request.attachments?.length ? (
              <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                {request.attachments.length} file
                {request.attachments.length !== 1 ? "s" : ""}
              </span>
            ) : undefined
          }
        />
        <div className="p-5">
          {!request.attachments || request.attachments.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">
              No attachments uploaded.
            </p>
          ) : (
            <AttachmentPreview
              attachments={request.attachments}
              requestId={id}
              canDelete={false}
            />
          )}
        </div>
      </GlassSection>

      {/* ── 5. Status update panel ── */}
      {showStatusPanel && (
        <GlassSection>
          <GlassSectionHeader
            icon={CheckCircle2}
            iconGradient="bg-gradient-to-br from-violet-500 to-purple-600"
            title="Update Status"
            badge={
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                On behalf of technician
              </span>
            }
          />
          <div className="p-5">
            <SupervisorStatusPanel
              requestId={id}
              currentStatus={currentStatus}
            />
          </div>
        </GlassSection>
      )}

      {/* ── 6. Feedback (completed only) ── */}
      {isCompleted && (
        <GlassSection>
          <GlassSectionHeader
            icon={Star}
            iconGradient="bg-gradient-to-br from-amber-400 to-orange-500"
            title="Requester Feedback"
          />
          <div className="p-5">
            <FeedbackPanel requestId={id} />
          </div>
        </GlassSection>
      )}

      {/* ── Footer nav ── */}
      <div className="flex items-center justify-between pt-1 pb-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <Link href="/supervisor">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <Link href="/supervisor/requests">
            All Requests
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
