import { createServiceClient } from '@/lib/supabase/service';
import { getRequestById } from '@/actions/request/request.actions';  // ✅ use the same query as requester
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/common/status-badge';
import { FeedbackPanel } from '@/components/feedback/feedback-panel';
import { StatusTimeline } from "@/components/requests/status-timeline";
import { AttachmentPreview } from '@/components/requests/attachment-preview';
import { Paperclip, User, Calendar, MapPin, Building, Mail, Wrench, CheckCircle2, ClipboardList } from 'lucide-react';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdminRequestDetailPage({ params }: Props) {
    const { id } = await params;
    

    const request = await getRequestById(id);
    if (!request) notFound();

    const currentStatus = request.statuses?.status_name ?? 'pending';
    const isCompleted = currentStatus === 'completed';

    const attachments = request.attachments ?? [];
    const history = request.status_history ?? []; 
    const timelineHistory = history as unknown as React.ComponentProps<typeof StatusTimeline>['history'];
    const rmr = request.rmr_details;
    const ppsr = request.ppsr_details;

    const formatDate = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
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
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{request.ticket_number}</h1>
                        <StatusBadge status={currentStatus} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Admin View – Full Access</p>
                </div>
            </div>

            {/* Two-column grid: Request Info + Work Details (unchanged) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Request Information - unchanged */}
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

                {/* Work Details - unchanged */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-slate-400" />
                        Work Details
                    </h3>
                    <div className="space-y-3">
                        {/* ... same as before ... */}
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

                        <div className="pt-3 border-t border-slate-50 dark:border-slate-800">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Description</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                {request.description ?? 'No description provided.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inspection Report, Feedback, Attachments (unchanged) */}
            {/* ... keep those sections as before ... */}

            {/* Status History – now using StatusTimeline */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-5 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-slate-400" />
                    Status History
                </h3>
                <StatusTimeline history={timelineHistory} />
            </div>
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