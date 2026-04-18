import { createServiceClient } from '@/lib/supabase/service';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/common/status-badge';
import { FeedbackPanel } from '@/components/feedback/feedback-panel';
import { AttachmentPreview } from '@/components/requests/attachment-preview';
import { Paperclip, User, Calendar, MapPin, Building, Mail, Wrench, CheckCircle2 } from 'lucide-react';

interface Props {
    params: Promise<{ id: string }>;
}

async function getRequestWithDetails(id: string) {
    const supabase = createServiceClient();
    const { data, error } = await supabase
        .from('requests')
        .select(`
            id,
            ticket_number,
            title,
            description,
            created_at,
            updated_at,
            actual_completion_date,
            request_type,
            statuses ( status_name ),
            priorities ( level ),
            categories ( category_name ),
            locations ( building_name, floor_level, room_number ),
            requester:users!requests_requester_id_fkey ( id, full_name, email, department ),
            attachments ( id, file_name, file_path, mime_type, file_size, uploaded_by ),
            ppsr_details ( service_type, service_data ),
            rmr_details ( inspection_date, inspection_time_start, inspection_time_end, repair_mode, estimated_duration, materials_available, manpower_required, inspector_notes ),
            status_history (
                id,
                changed_at,
                change_reason,
                old_status:statuses!status_history_old_status_id_fkey ( status_name ),
                new_status:statuses!status_history_new_status_id_fkey ( status_name ),
                changer:users!status_history_changed_by_fkey ( full_name, role )
            )
        `)
        .eq('id', id)
        .single();

    if (error || !data) return null;

    // Transform array relations to single objects
    return {
        ...data,
        statuses: data.statuses?.[0] ?? null,
        priorities: data.priorities?.[0] ?? null,
        categories: data.categories?.[0] ?? null,
        locations: data.locations?.[0] ?? null,
        requester: data.requester?.[0] ?? null,
        ppsr_details: data.ppsr_details?.[0] ?? null,
        rmr_details: data.rmr_details?.[0] ?? null,
        status_history: (data.status_history ?? []).map((h: any) => ({
            ...h,
            old_status: h.old_status?.[0] ?? null,
            new_status: h.new_status?.[0] ?? null,
            changer: h.changer?.[0] ?? null,
        })),
    };
}

export default async function AdminRequestDetailPage({ params }: Props) {
    const { id } = await params;
    const request = await getRequestWithDetails(id);
    if (!request) notFound();

    const currentStatus = request.statuses?.status_name ?? 'pending';
    const isCompleted = currentStatus === 'completed';

    const attachments = request.attachments ?? [];
    const rmr = request.rmr_details;
    const ppsr = request.ppsr_details;

    const formatDate = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatDateTime = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-PH');
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {request.ticket_number}
                        </h1>
                        <StatusBadge status={currentStatus} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Admin View – Full Access
                    </p>
                </div>
            </div>

            {/* Two-column grid: Request Info + Work Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Request Information */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        Request Information
                    </h3>
                    <div className="space-y-2">
                        <InfoRow label="Ticket #" value={request.ticket_number} />
                        <InfoRow label="Title" value={request.title} />
                        <InfoRow label="Created" value={formatDateTime(request.created_at)} />
                        <InfoRow label="Completed" value={formatDate(request.actual_completion_date)} />
                        <InfoRow label="Priority" value={request.priorities?.level ?? '—'} />
                        <InfoRow label="Category" value={request.categories?.category_name ?? '—'} />
                        <InfoRow label="Building" value={request.locations?.building_name ?? '—'} />
                        <InfoRow label="Location" value={
                            [
                                request.locations?.floor_level && `Floor ${request.locations.floor_level}`,
                                request.locations?.room_number && `Room ${request.locations.room_number}`
                            ].filter(Boolean).join(', ') || '—'
                        } />
                        <InfoRow label="Requester" value={request.requester?.full_name ?? '—'} />
                        <InfoRow label="Department" value={request.requester?.department ?? '—'} />
                        <InfoRow label="Email" value={request.requester?.email ?? '—'} />
                    </div>
                </div>

                {/* Work Details */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-slate-400" />
                        Work Details
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                                {request.request_type === 'rmr' ? 'Nature of Work' : 'Service Type'}
                            </p>
                            {request.request_type === 'rmr' ? (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {request.categories?.category_name ?? '—'}
                                    </span>
                                </div>
                            ) : ppsr ? (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                                        {ppsr.service_type?.replace(/_/g, ' ') ?? '—'}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm text-slate-400">—</span>
                            )}
                        </div>

                        {/* PPSR service data fields */}
                        {ppsr?.service_data && typeof ppsr.service_data === 'object' && (
                            <div className="mt-2 space-y-1">
                                {Object.entries(ppsr.service_data as Record<string, unknown>)
                                    .filter(([, v]) => v !== null && v !== undefined && v !== '')
                                    .map(([key, val]) => (
                                        <div key={key} className="flex gap-2 text-sm">
                                            <span className="text-slate-400 min-w-[160px] shrink-0 capitalize">
                                                {key.replace(/_/g, ' ')}:
                                            </span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="pt-3 border-t border-slate-50 dark:border-slate-800">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Description</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                {request.description ?? 'No description provided.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inspection Report (RMR only) */}
            {request.request_type === 'rmr' && rmr && (rmr.inspection_date || rmr.inspector_notes) && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-slate-400" />
                        Inspection Report
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                        {rmr.inspection_date && <InfoRow label="Date" value={formatDate(rmr.inspection_date)} />}
                        {rmr.inspection_time_start && <InfoRow label="Time Start" value={rmr.inspection_time_start} />}
                        {rmr.inspection_time_end && <InfoRow label="Time End" value={rmr.inspection_time_end} />}
                        {rmr.repair_mode && <InfoRow label="Repair Mode" value={rmr.repair_mode} />}
                        {rmr.estimated_duration && <InfoRow label="Est. Duration" value={rmr.estimated_duration} />}
                        {rmr.materials_available !== null && (
                            <InfoRow label="Materials" value={rmr.materials_available ? 'Available' : 'Not available'} />
                        )}
                        {rmr.manpower_required !== null && (
                            <InfoRow label="Manpower" value={`${rmr.manpower_required} person(s)`} />
                        )}
                    </div>
                    {rmr.inspector_notes && (
                        <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Inspector Notes</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{rmr.inspector_notes}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Feedback Panel (only if completed) */}
            {isCompleted && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                        Requester Feedback
                    </h3>
                    <FeedbackPanel requestId={id} />
                </div>
            )}

            {/* Attachments with Admin Delete Permission */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-slate-400" />
                    Attachments
                </h3>
                {attachments.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No attachments uploaded.</p>
                ) : (
                    <AttachmentPreview
                        attachments={attachments}
                        requestId={id}
                        canDelete={true}
                    />
                )}
            </div>

            {/* Status History */}
            {request.status_history && request.status_history.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                        Status History
                    </h3>
                    <div className="space-y-2">
                        {request.status_history.map((h: any, idx: number) => (
                            <div key={idx} className="text-sm border-b last:border-0 py-2">
                                <div className="flex flex-wrap justify-between gap-2">
                                    <span className="font-medium">
                                        {h.old_status?.status_name} → {h.new_status?.status_name}
                                    </span>
                                    <span className="text-xs text-slate-400">{formatDateTime(h.changed_at)}</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    By {h.changer?.full_name} ({h.changer?.role})
                                    {h.change_reason && ` · Reason: ${h.change_reason}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
    if (!value || value === '—') return null;
    return (
        <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate ml-4">{value}</span>
        </div>
    );
}