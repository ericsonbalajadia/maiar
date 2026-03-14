// components/common/status-badge.tsx
import { cn } from '@/lib/utils'
import { STATUS_STYLES, PRIORITY_STYLES } from '@/lib/utils/status'

// ─── Status Badge ─────────────────────────────────────────────────────────────
// Maps status_name from DB (snake_case) to styled pill

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, '_')
  const style = STATUS_STYLES[key] ?? {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  }

  const label = STATUS_DISPLAY_LABELS[key] ?? humanise(status)

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
      style.bg, style.text, className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />
      {label}
    </span>
  )
}

// Human-readable overrides for DB status_name values
const STATUS_DISPLAY_LABELS: Record<string, string> = {
  pending:      'Pending',
  under_review: 'Under Review',
  approved:     'Approved',
  assigned:     'Assigned',
  in_progress:  'In Progress',
  completed:    'Completed',
  cancelled:    'Cancelled',
}

function humanise(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

interface PriorityBadgeProps {
  level: string
  className?: string
}

export function PriorityBadge({ level, className }: PriorityBadgeProps) {
  const key = level.toLowerCase()
  const style = PRIORITY_STYLES[key] ?? { bg: 'bg-slate-100', text: 'text-slate-600' }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border',
      style.bg, style.text,
      // Border colour matches text
      key === 'emergency' ? 'border-red-200'
        : key === 'high' ? 'border-amber-200'
        : key === 'normal' ? 'border-blue-200'
        : 'border-slate-200',
      className
    )}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  )
}

// ─── Request Type Badge ───────────────────────────────────────────────────────

interface RequestTypeBadgeProps {
  type: string
  showFull?: boolean
  className?: string
}

export function RequestTypeBadge({ type, showFull = false, className }: RequestTypeBadgeProps) {
  const isRmr = type === 'rmr'
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide whitespace-nowrap border',
      isRmr
        ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800'
        : 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800',
      className
    )}>
      {showFull
        ? isRmr ? 'FM-GSO-09 · R&M' : 'FM-GSO-15 · PPSR'
        : isRmr ? 'R&M' : 'PPSR'
      }
    </span>
  )
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  student:    { bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-700 dark:text-blue-400',    border: 'border-blue-200 dark:border-blue-800' },
  staff:      { bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-700 dark:text-blue-400',    border: 'border-blue-200 dark:border-blue-800' },
  clerk:      { bg: 'bg-cyan-50 dark:bg-cyan-900/20',    text: 'text-cyan-700 dark:text-cyan-400',    border: 'border-cyan-200 dark:border-cyan-800' },
  technician: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  supervisor: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
  admin:      { bg: 'bg-rose-50 dark:bg-rose-900/20',    text: 'text-rose-700 dark:text-rose-400',    border: 'border-rose-200 dark:border-rose-800' },
}

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  const style = ROLE_STYLES[role] ?? { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' }
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border',
      style.bg, style.text, style.border, className
    )}>
      {role}
    </span>
  )
}

// ─── Signup Status Badge ──────────────────────────────────────────────────────

const SIGNUP_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  pending:  { bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-700 dark:text-amber-400',  border: 'border-amber-200 dark:border-amber-800' },
  approved: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  rejected: { bg: 'bg-red-50 dark:bg-red-900/20',       text: 'text-red-700 dark:text-red-400',      border: 'border-red-200 dark:border-red-800' },
}

export function SignupStatusBadge({ status, className }: { status: string; className?: string }) {
  const style = SIGNUP_STYLES[status] ?? { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' }
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border',
      style.bg, style.text, style.border, className
    )}>
      {status}
    </span>
  )
}