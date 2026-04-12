// components/clerk/request-detail-panel.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusUpdatePanel } from '@/components/clerk/status-update-panel';
import { RequestTimeline } from '@/components/tracking/requestTimeline';
import type { RequestDetail } from '@/types/requests.model';
import type { StatusHistoryEntry } from '@/lib/types/tracking';

interface RequestDetailPanelProps {
  request: RequestDetail;
  hideStatusPanel?: boolean;
}

function mapToStatusHistoryEntry(history: NonNullable<RequestDetail['status_history']>): StatusHistoryEntry[] {
  return history.map((item) => ({
    id: item.id,
    request_id: item.request_id,
    changed_at: item.changed_at,
    change_reason: item.change_reason,
    // Convert Json to Record<string, unknown> or null
    metadata: item.metadata && typeof item.metadata === 'object' && !Array.isArray(item.metadata)
      ? (item.metadata as Record<string, unknown>)
      : null,
    old_status: item.old_status
      ? { id: '', status_name: item.old_status.status_name }
      : { id: '', status_name: 'N/A' },
    new_status: { id: '', status_name: item.new_status.status_name },
    changed_by_user: item.changed_by_user
      ? {
          id: '',
          full_name: item.changed_by_user.full_name,
          role: item.changed_by_user.role,
        }
      : { id: '', full_name: 'System', role: 'system' },
  }));
}

export function RequestDetailPanel({ request, hideStatusPanel = false }: RequestDetailPanelProps){
  const status = request.statuses?.status_name ?? 'unknown';
  const priority = request.priorities?.level ?? 'unknown';
  const requester = request.requester;
  const location = request.locations;
  const review = request.request_reviews?.[0]; // most recent review
  const mappedHistory = mapToStatusHistoryEntry(request.status_history ?? []);
  const attachments = request.attachments ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-mono">{request.ticket_number}</p>
          <h2 className="text-xl font-bold">{request.title}</h2>
        </div>
        <Badge variant={status === 'pending' ? 'outline' : 'default'}>{status}</Badge>
      </div>

      <Separator />

      {/* Request Details Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <Field label="Category" value={request.categories?.category_name} />
        <Field label="Priority" value={priority} />
        <Field label="Location" value={`${location?.building_name ?? ''} ${location?.room_number ?? ''}`.trim()} />
        <Field label="Submitted" value={new Date(request.created_at).toLocaleString()} />
      </div>

      {/* Description */}
      <section>
        <h3 className="text-sm font-semibold mb-1">Description</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.description}</p>
      </section>

      <Separator />

      {/* Requester Info */}
      <section>
        <h3 className="text-sm font-semibold mb-2">Requester</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Field label="Name" value={requester?.full_name} />
          <Field label="Email" value={requester?.email} />
          <Field label="Department" value={requester?.department} />
        </div>
      </section>

      <Separator />

      {/* Assigned Technician (if any) */}
      {request.assigned_technician && (
        <>
          <section>
            <h3 className="text-sm font-semibold mb-2">Assigned Technician</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Field label="Name" value={request.assigned_technician.full_name} />
              <Field label="Email" value={request.assigned_technician.email} />
            </div>
          </section>
          <Separator />
        </>
      )}

      {/* Review Record (if exists) */}
      {review && (
        <>
          <section>
            <h3 className="text-sm font-semibold mb-2">Review Record</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Field label="Decision" value={review.decision} />
              <Field label="Reviewed" value={new Date(review.reviewed_at).toLocaleString()} />
              <Field label="Reviewer" value={review.reviewer?.full_name} />
            </div>
            {review.review_notes && (
              <p className="mt-2 text-sm text-muted-foreground">{review.review_notes}</p>
            )}
          </section>
          <Separator />
        </>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <>
          <section>
            <h3 className="text-sm font-semibold mb-2">Attachments ({attachments.length})</h3>
            <ul className="space-y-1">
              {attachments.map((a) => (
                <li key={a.id} className="text-sm text-muted-foreground">
                  {a.file_name} — <span className="italic">{a.mime_type || 'attachment'}</span>
                </li>
              ))}
            </ul>
          </section>
          <Separator />
        </>
      )}

      {/* Status History Timeline */}
      <section>
        <h3 className="text-sm font-semibold mb-2">Status History</h3>
        <RequestTimeline history={mappedHistory} />
      </section>

      <Separator />

       {/* Status Actions – only show if not hidden */}
      {!hideStatusPanel && (
        <StatusUpdatePanel
          requestId={request.id}
          currentStatus={status}
          ticketNumber={request.ticket_number}
        />
      )}
    </div>
  );
}

// Helper component for label-value pairs
function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value ?? '—'}</span>
    </div>
  );
}