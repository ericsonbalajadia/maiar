'use client';

/**
 * REQUEST TIMELINE COMPONENT (For Clerk/Supervisor Views)
 * ────────────────────────────────────────────────────────────────────────────
 * Timeline visualization with hardcoded hex colors for status text.
 * Uses bold colored text (no background) for emphasis.
 */

import { formatDistanceToNow, format } from 'date-fns';
import type { StatusHistoryEntry } from '@/lib/types/tracking';

interface Props {
    history: StatusHistoryEntry[];
}

/**
 * Get hardcoded inline styles for status text coloring
 * Bold colored text with no background container
 */
function getStatusStyle(statusName: string) {
    const normalized = statusName.toLowerCase().replace(/\s+/g, '_');
    
    switch (normalized) {
        case 'pending':
            return { label: 'Pending', text: '#78350F' };
        case 'under_review':
            return { label: 'Under Review', text: '#9F1239' };
        case 'approved':
            return { label: 'Approved', text: '#1E40AF' };
        case 'assigned':
            return { label: 'Assigned', text: '#3730A3' };
        case 'in_progress':
            return { label: 'In Progress', text: '#6B21A8' };
        case 'completed':
            return { label: 'Completed', text: '#15803D' };
        case 'cancelled':
            return { label: 'Cancelled', text: '#991B1B' };
        case 'rejected':
            return { label: 'Rejected', text: '#991B1B' };
        default:
            return { label: statusName, text: '#475569' };
    }
}

export function RequestTimeline({ history }: Props) {
    if (!history.length) {
        return (
            <p className="text-sm text-muted-foreground text-center py-8">
                No status history yet.
            </p>
        );
    }

    return (
        <ol className="relative border-l border-border ml-4 space-y-6">
            {history.map((entry, idx) => {
                const cfg = getStatusStyle(entry.new_status.status_name);
                const isLast = idx === history.length - 1;

                return (
                    <li key={entry.id} className="ml-6">
                        <span
                            className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background"
                            style={{ backgroundColor: '#CBD5E1' }}
                        />
                        <div className="rounded-lg border bg-card p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span 
                                    className="text-sm font-bold"
                                    style={{ color: cfg.text }}
                                >
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