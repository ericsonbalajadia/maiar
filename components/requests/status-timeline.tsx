// components/requests/status-timeline.tsx
/**
 * STATUS TIMELINE COMPONENT
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a vertical chronological timeline of status_history entries.
 * Uses centralized BADGE_STYLES for consistent coloring across the app.
 * Each entry shows: status, who changed it, when, and optional reason.
 */

import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { BADGE_STYLES } from '@/lib/constants/badge-styles'

// ─── Types ────────────────────────────────────────────────────────────────────

// Shape returned from getRequestById status_history join.
// statuses is the old/new join alias — we normalise below.
export interface StatusHistoryEntry {
  id: string
  request_id: string
  old_status_id: string | null
  new_status_id: string
  changed_by: string | null
  changed_at: string
  change_reason: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
  // joined — shape from request.actions.ts:
  // statuses: { status_name } refers to new_status via the FK hint
  statuses?: { status_name: string } | null
  // The action also selects old/new separately via alias in the detail page
  old_status?: { status_name: string } | null
  new_status?: { status_name: string } | null
  changed_by_user?: { full_name: string } | null
}

interface Props {
  history: StatusHistoryEntry[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Resolve the new status name regardless of alias shape
function resolveNewStatus(entry: StatusHistoryEntry): string {
  return (
    entry.new_status?.status_name ??
    entry.statuses?.status_name ??
    'unknown'
  )
}

function resolveOldStatus(entry: StatusHistoryEntry): string | null {
  return entry.old_status?.status_name ?? null
}

function resolveChangedBy(entry: StatusHistoryEntry): string {
  return entry.changed_by_user?.full_name ?? 'System'
}

const TERMINAL = ['completed', 'cancelled']

/**
 * StatusDot Component
 * Displays a colored dot with appropriate icon based on status.
 * Uses centralized styles for consistency.
 */
function StatusDot({ status }: { status: string }) {
  const normalised = status.toLowerCase().replace(/\s+/g, '_')
  const timelineStyle = BADGE_STYLES.timeline[normalised as keyof typeof BADGE_STYLES.timeline]

  if (normalised === 'completed') {
    const style = timelineStyle || BADGE_STYLES.timeline.completed
    return (
      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${style.dot} ${style.border}`}>
        <CheckCircle2 className={`h-4 w-4 ${style.icon}`} />
      </div>
    )
  }

  if (normalised === 'cancelled') {
    const style = timelineStyle || BADGE_STYLES.timeline.cancelled
    return (
      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${style.dot} ${style.border}`}>
        <XCircle className={`h-4 w-4 ${style.icon}`} />
      </div>
    )
  }

  // Default pending/in-progress style
  const style = BADGE_STYLES.timeline.pending
  return (
    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${style.dot} ${style.border}`}>
      <Clock className={`h-3.5 w-3.5 ${style.icon}`} />
    </div>
  )
}

function statusLabel(name: string) {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Get hardcoded inline styles for status styling in timeline
 * Uses actual color values since dynamic Tailwind classes aren't being compiled
 */
function getStatusStyles(status: string): { bg: string; text: string } {
  const normalised = status.toLowerCase().replace(/\s+/g, '_')
  
  switch (normalised) {
    case 'pending':
      return { bg: '#FCD34D', text: '#78350F' }
    case 'under_review':
      return { bg: '#FBE7E6', text: '#9F1239' }
    case 'approved':
      return { bg: '#DBEAFE', text: '#1E40AF' }
    case 'assigned':
      return { bg: '#E0E7FF', text: '#3730A3' }
    case 'in_progress':
      return { bg: '#E9D5FF', text: '#6B21A8' }
    case 'completed':
      return { bg: '#DCFCE7', text: '#15803D' }
    case 'cancelled':
      return { bg: '#FEE2E2', text: '#991B1B' }
    case 'rejected':
      return { bg: '#FEE2E2', text: '#991B1B' }
    default:
      return { bg: '#F2F4F8', text: '#475569' }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StatusTimeline({ history }: Props) {
  if (!history || history.length === 0) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500 italic">No status history recorded yet.</p>
    )
  }

  // Sort ascending — earliest first (already should be from query, but guard)
  const sorted = [...history].sort(
    (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime(),
  )

  return (
    <div className="relative space-y-0">
      {sorted.map((entry, idx) => {
        const newStatus = resolveNewStatus(entry)
        const oldStatus = resolveOldStatus(entry)
        const changedBy = resolveChangedBy(entry)
        const isLast = idx === sorted.length - 1
        const isTerminal = TERMINAL.includes(newStatus.toLowerCase().replace(/\s+/g, '_'))

        return (
          <div key={entry.id} className="flex gap-4">
            {/* Left: dot + connector line */}
            <div className="flex flex-col items-center">
              <StatusDot status={newStatus} />
              {!isLast && (
                <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1 mb-1 min-h-[1.5rem]" />
              )}
            </div>

            {/* Right: content */}
            <div className={`flex-1 pb-5 ${isLast ? 'pb-0' : ''}`}>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  {(() => {
                    const styles = getStatusStyles(newStatus)
                    return (
                      <span 
                        style={{ 
                          color: styles.text,
                          fontWeight: 'bold'
                        }}
                      >
                        {statusLabel(newStatus)}
                      </span>
                    )
                  })()}
                  {oldStatus && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-1">
                      from{' '}
                      <span className="italic">{statusLabel(oldStatus)}</span>
                    </p>
                  )}
                  {entry.change_reason && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      {entry.change_reason}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDateTime(entry.changed_at)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    by{' '}
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {changedBy}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}