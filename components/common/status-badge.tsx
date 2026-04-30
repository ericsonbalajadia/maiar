// components/common/status-badge.tsx
/**
 * Badge Components - Centralized
 * ────────────────────────────────────────────────────────────────────────────
 * All badge types use consistent styling from the centralized BADGE_STYLES
 * configuration (lib/constants/badge-styles.ts). This ensures:
 * - Consistent colors across the project
 * - Unified dark mode support
 * - Standard sizing and spacing
 * - Easy maintenance and updates
 */

import { cn } from '@/lib/utils'
import {
  BADGE_STYLES,
  BADGE_SIZING,
  type StatusType,
  type RoleType,
  type PriorityType,
  type RequestTypeType,
  type SignupStatusType,
} from '@/lib/constants/badge-styles'

// ─── Status Badge ─────────────────────────────────────────────────────────────
/**
 * Displays request status with colored dot indicator and label.
 * Statuses: pending, under_review, approved, assigned, in_progress, completed, cancelled
 */
interface StatusBadgeProps {
  status: string
  className?: string
  compact?: boolean
}

export function StatusBadge({ status, className, compact = false }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_') as StatusType
  const style = BADGE_STYLES.status[normalizedStatus] ?? {
    bg: 'bg-slate-100 dark:bg-slate-900/20',
    text: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400 dark:bg-slate-500',
  }
  const dotSize = compact ? BADGE_SIZING.dot.compact : BADGE_SIZING.dot.size
  const padding = compact ? BADGE_SIZING.compact : BADGE_SIZING.padding
  const gap = compact ? BADGE_SIZING.compact_gap : BADGE_SIZING.gap

  return (
    <span
      className={cn(
        'inline-flex items-center',
        padding,
        BADGE_SIZING.radius,
        BADGE_SIZING.fontSize,
        BADGE_SIZING.fontWeight,
        BADGE_SIZING.whitespace,
        style.bg,
        style.text,
        gap,
        className
      )}
    >
      <span className={cn('rounded-full shrink-0', dotSize, style.dot)} />
      {style.label}
    </span>
  )
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
/**
 * Displays request priority with border.
 * Priorities: emergency, high, normal, low
 */
interface PriorityBadgeProps {
  level: string
  className?: string
  compact?: boolean
}

export function PriorityBadge({ level, className, compact = false }: PriorityBadgeProps) {
  const normalizedLevel = level.toLowerCase() as PriorityType
  const style = BADGE_STYLES.priority[normalizedLevel] ?? {
    bg: 'bg-slate-100 dark:bg-slate-900/20',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800',
  }
  const padding = compact ? BADGE_SIZING.compact : BADGE_SIZING.padding

  return (
    <span
      className={cn(
        'inline-flex items-center border',
        padding,
        BADGE_SIZING.radius,
        BADGE_SIZING.fontSize,
        BADGE_SIZING.fontWeight,
        BADGE_SIZING.whitespace,
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {style.label}
    </span>
  )
}

// ─── Request Type Badge ───────────────────────────────────────────────────────
/**
 * Displays request type (R&M or PPSR) with optional full form.
 * Types: rmr, ppsr
 */
interface RequestTypeBadgeProps {
  type: string
  showFull?: boolean
  className?: string
  compact?: boolean
}

export function RequestTypeBadge({
  type,
  showFull = false,
  className,
  compact = false,
}: RequestTypeBadgeProps) {
  const normalizedType = type.toLowerCase() as RequestTypeType
  const style = BADGE_STYLES.requestType[normalizedType] ?? {
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    text: 'text-slate-700 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800',
    label: 'Unknown',
    fullLabel: 'Unknown',
  }
  const padding = compact ? BADGE_SIZING.compact : BADGE_SIZING.padding
  const label = showFull ? style.fullLabel : style.label

  return (
    <span
      className={cn(
        'inline-flex items-center border font-bold tracking-wide',
        padding,
        BADGE_SIZING.radius,
        BADGE_SIZING.fontSize,
        BADGE_SIZING.whitespace,
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {label}
    </span>
  )
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
/**
 * Displays user role with color-coded background.
 * Roles: student, staff, clerk, technician, supervisor, admin
 */
export function RoleBadge({ role, className, compact = false }: { role: string; className?: string; compact?: boolean }) {
  const normalizedRole = role.toLowerCase() as RoleType
  const style = BADGE_STYLES.role[normalizedRole] ?? {
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800',
  }
  const padding = compact ? BADGE_SIZING.compact : BADGE_SIZING.padding

  return (
    <span
      className={cn(
        'inline-flex items-center border capitalize',
        padding,
        BADGE_SIZING.radius,
        BADGE_SIZING.fontSize,
        BADGE_SIZING.fontWeight,
        BADGE_SIZING.whitespace,
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {role}
    </span>
  )
}

// ─── Signup Status Badge ──────────────────────────────────────────────────────
/**
 * Displays user signup approval status.
 * Statuses: pending, approved, rejected
 */
export function SignupStatusBadge({
  status,
  className,
  compact = false,
}: { status: string; className?: string; compact?: boolean }) {
  const normalizedStatus = status.toLowerCase() as SignupStatusType
  const style = BADGE_STYLES.signupStatus[normalizedStatus] ?? {
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800',
  }
  const padding = compact ? BADGE_SIZING.compact : BADGE_SIZING.padding

  return (
    <span
      className={cn(
        'inline-flex items-center border capitalize',
        padding,
        BADGE_SIZING.radius,
        BADGE_SIZING.fontSize,
        BADGE_SIZING.fontWeight,
        BADGE_SIZING.whitespace,
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {status}
    </span>
  )
}