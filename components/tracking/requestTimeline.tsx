'use client';

import { formatDistanceToNow, format } from 'date-fns';
import type { StatusHistoryEntry } from '@/lib/types/tracking';

interface Props {
    history: StatusHistoryEntry[];
}

export function RequestTimeline({ history }: Props) {
    if (!history.length) {
        return (
            <p className="text-sm text-muted-foreground text-center py-8">
                No status history yet.
            </p>
        );
    }

    // Status color mapping (you can import STATUS_CONFIG from tracking.ts if defined)
    const getStatusStyle = (statusName: string) => {
        const config: Record<string, { color: string; bg: string; label: string }> = {
            pending: { label: 'Pending', color: '#D97706', bg: '#FEF3C7' },
            under_review: { label: 'Under Review', color: '#2563EB', bg: '#DBEAFE' },
            approved: { label: 'Approved', color: '#16A34A', bg: '#DCFCE7' },
            assigned: { label: 'Assigned', color: '#7C3AED', bg: '#EDE9FE' },
            in_progress: { label: 'In Progress', color: '#0891B2', bg: '#E0F2FE' },
            completed: { label: 'Completed', color: '#15803D', bg: '#F0FDF4' },
            cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2' },
        };
        return config[statusName] ?? { label: statusName, color: '#64748B', bg: '#F1F5F9' };
    };

    return (
        <ol className="relative border-l border-border ml-4 space-y-6">
            {history.map((entry, idx) => {
                const cfg = getStatusStyle(entry.new_status.status_name);
                const isLast = idx === history.length - 1;

                return (
                    <li key={entry.id} className="ml-6">
                        <span
                            className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background"
                            style={{ backgroundColor: isLast ? cfg.color : '#CBD5E1' }}
                        />
                        <div className="rounded-lg border bg-card p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-sm font-semibold" style={{ color: cfg.color }}>
                                    {cfg.label}
                                </span>
                                <time className="text-xs text-muted-foreground">
                                    {format(new Date(entry.changed_at), 'MMM dd, yyyy HH:mm')}
                                    {' · '}
                                    {formatDistanceToNow(new Date(entry.changed_at), { addSuffix: true })}
                                </time>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                By <strong>{entry.changed_by_user?.full_name ?? 'System'}</strong>
                                {' '}({entry.changed_by_user?.role ?? 'system'})
                            </p>
                            {entry.change_reason && (
                                <p className="mt-2 text-sm text-foreground">{entry.change_reason}</p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}