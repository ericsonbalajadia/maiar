"use client";

import { StatusUpdatePanel } from "@/components/clerk/status-update-panel";
import { RequestTimeline } from "@/components/tracking/requestTimeline";
import { StatusBadge } from "@/components/common/status-badge";
import type { RequestDetail } from "@/types/requests.model";
import type { StatusHistoryEntry } from "@/lib/types/tracking";
import {
  Tag, MapPin, Calendar, User, Mail, Paperclip,
  ClipboardCheck, History, CheckCircle2, Clock, Hash,
} from "lucide-react";

// ─── Helper (unchanged) ───────────────────────────────────────────────────────

function mapToStatusHistoryEntry(
  history: NonNullable<RequestDetail["status_history"]>
): StatusHistoryEntry[] {
  return history.map((item) => ({
    id: item.id,
    request_id: item.request_id,
    changed_at: item.changed_at,
    change_reason: item.change_reason,
    metadata:
      item.metadata &&
      typeof item.metadata === "object" &&
      !Array.isArray(item.metadata)
        ? (item.metadata as Record<string, unknown>)
        : null,
    old_status: item.old_status
      ? { id: "", status_name: item.old_status.status_name }
      : { id: "", status_name: "N/A" },
    new_status: { id: "", status_name: item.new_status.status_name },
    changed_by_user: item.changed_by_user
      ? { id: "", full_name: item.changed_by_user.full_name, role: item.changed_by_user.role }
      : { id: "", full_name: "System", role: "system" },
  }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  iconGradient,
  title,
}: {
  icon: React.ElementType;
  iconGradient: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${iconGradient}`}
      >
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h3>
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function InfoCell({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-3 w-3 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p
          className={`text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5 ${
            mono ? "font-mono" : ""
          }`}
        >
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface RequestDetailPanelProps {
  request: RequestDetail;
  hideStatusPanel?: boolean;
  variant?: "glass" | "plain";
}

export function RequestDetailPanel({
  request,
  hideStatusPanel = false,
  variant = "glass",
}: RequestDetailPanelProps) {
  const status = request.statuses?.status_name ?? "unknown";
  const priority = request.priorities?.level ?? "unknown";
  const requester = request.requester;
  const location = request.locations;
  const review = request.request_reviews?.[0];
  const mappedHistory = mapToStatusHistoryEntry(request.status_history ?? []);
  const attachments = request.attachments ?? [];

  const canUpdate = ["pending", "under_review"].includes(status);
  const showStatusActions = !hideStatusPanel && canUpdate;

  const locationFull = [
    location?.building_name,
    location?.room_number ? `Room ${location.room_number}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const containerClasses =
    variant === "glass"
      ? "rounded-2xl border border-white/60 dark:border-slate-700/60 p-6"
      : "";

  const containerStyle =
    variant === "glass"
      ? { background: "var(--glass-bg)", backdropFilter: "blur(12px)" }
      : {};

  return (
    <div className={containerClasses} style={containerStyle}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {request.ticket_number}
            </span>
            <StatusBadge status={status} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {request.title}
          </h2>
        </div>
      </div>

      {/* Two‑column: Request Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Request Details */}
        <div className="rounded-xl border p-5 bg-white/40 dark:bg-slate-900/40">
          <SectionHeader
            icon={Tag}
            iconGradient="bg-gradient-to-br from-amber-400 to-orange-500"
            title="Request Details"
          />
          <InfoGrid>
            <InfoCell icon={Tag} label="Category" value={request.categories?.category_name} />
            <InfoCell icon={Clock} label="Priority" value={priority} />
            <InfoCell icon={MapPin} label="Location" value={locationFull} />
            <InfoCell icon={Calendar} label="Submitted" value={new Date(request.created_at).toLocaleString()} />
            <InfoCell icon={Hash} label="Type" value={request.request_type} />
          </InfoGrid>
          {request.description && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-400 mb-1">Description</p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm">
                {request.description}
              </div>
            </div>
          )}
        </div>

        {/* Right: Timeline */}
        <div className="rounded-xl border p-5 bg-white/40 dark:bg-slate-900/40">
          <SectionHeader
            icon={History}
            iconGradient="bg-gradient-to-br from-slate-400 to-slate-600"
            title="Status Timeline"
          />
          <RequestTimeline history={mappedHistory} />
        </div>
      </div>

      {/* Attachments (if any) – full width */}
      {attachments.length > 0 && (
        <div className="rounded-xl border p-5 bg-white/40 dark:bg-slate-900/40 mb-6">
          <SectionHeader
            icon={Paperclip}
            iconGradient="bg-gradient-to-br from-slate-500 to-slate-700"
            title={`Attachments (${attachments.length})`}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            {attachments.map((a) => (
              <div key={a.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                <Paperclip className="h-4 w-4 text-slate-400" />
                <span className="text-sm truncate">{a.file_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vertical stack of info cards (Requester, Technician, Review, Actions) */}
      <div className="space-y-4">
        {/* Requester card */}
        <div className="rounded-xl border p-4 bg-white/40 dark:bg-slate-900/40">
          <SectionHeader
            icon={User}
            iconGradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            title="Requester"
          />
          <InfoGrid>
            <InfoCell icon={User} label="Name" value={requester?.full_name} />
            <InfoCell icon={Mail} label="Email" value={requester?.email} />
          </InfoGrid>
        </div>

        {/* Technician card (if assigned) */}
        {request.assigned_technician && (
          <div className="rounded-xl border p-4 bg-white/40 dark:bg-slate-900/40">
            <SectionHeader
              icon={User}
              iconGradient="bg-gradient-to-br from-teal-400 to-emerald-600"
              title="Technician"
            />
            <InfoGrid>
              <InfoCell icon={User} label="Name" value={request.assigned_technician.full_name} />
              <InfoCell icon={Mail} label="Email" value={request.assigned_technician.email} />
            </InfoGrid>
          </div>
        )}

        {/* Review card (if exists) */}
        {review && (
          <div className="rounded-xl border p-4 bg-white/40 dark:bg-slate-900/40">
            <SectionHeader
              icon={ClipboardCheck}
              iconGradient="bg-gradient-to-br from-emerald-400 to-teal-600"
              title="Review"
            />
            <InfoGrid>
              <InfoCell icon={CheckCircle2} label="Decision" value={review.decision} />
              <InfoCell icon={User} label="Reviewer" value={review.reviewer?.full_name} />
            </InfoGrid>
          </div>
        )}

        {/* Status Actions card (if applicable) */}
        {showStatusActions && (
          <div className="rounded-xl border p-4 bg-white/40 dark:bg-slate-900/40">
            <SectionHeader
              icon={CheckCircle2}
              iconGradient="bg-gradient-to-br from-amber-400 to-orange-500"
              title="Actions"
            />
            <StatusUpdatePanel
              requestId={request.id}
              currentStatus={status}
              ticketNumber={request.ticket_number}
            />
          </div>
        )}
      </div>
    </div>
  );
}