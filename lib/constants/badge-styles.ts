/**
 * CENTRALIZED BADGE STYLING CONFIGURATION
 * ─────────────────────────────────────────
 * Single source of truth for all badge colors and styles.
 * Ensures consistency across request statuses, roles, priorities, and signup status.
 * 
 * Structure:
 *   - status: Request workflow statuses (pending, under_review, approved, etc.)
 *   - role: User roles (student, staff, clerk, technician, supervisor, admin)
 *   - priority: Request priority levels (emergency, high, normal, low)
 *   - requestType: Request types (rmr, ppsr)
 *   - signupStatus: User signup approval statuses (pending, approved, rejected)
 */

export const BADGE_STYLES = {
  // ─── REQUEST STATUS BADGES ──────────────────────────────────────────────────
  // All use consistent styling: saturated colors with strong text contrast (100 bg / 800 text)
  // Label lengths normalized to longest ("Under Review" = 12 chars) for consistent badge width
  status: {
    pending: {
      bg: 'bg-amber-100 dark:bg-amber-900/20',
      text: 'text-amber-800 dark:text-amber-400',
      dot: 'bg-amber-500 dark:bg-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      label: '  Pending    ',
    },
    under_review: {
      bg: 'bg-rose-100 dark:bg-rose-900/20',
      text: 'text-rose-800 dark:text-rose-400',
      dot: 'bg-rose-500 dark:bg-rose-400',
      border: 'border-rose-200 dark:border-rose-800',
      label: 'Under Review',
    },
    approved: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      text: 'text-blue-800 dark:text-blue-400',
      dot: 'bg-blue-500 dark:bg-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      label: '  Approved   ',
    },
    assigned: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/20',
      text: 'text-indigo-800 dark:text-indigo-400',
      dot: 'bg-indigo-500 dark:bg-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800',
      label: '  Assigned   ',
    },
    in_progress: {
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      text: 'text-purple-800 dark:text-purple-400',
      dot: 'bg-purple-500 dark:bg-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      label: ' In Progress ',
    },
    completed: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/20',
      text: 'text-emerald-800 dark:text-emerald-400',
      dot: 'bg-emerald-500 dark:bg-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      label: '  Completed  ',
    },
    cancelled: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-400',
      dot: 'bg-red-500 dark:bg-red-400',
      border: 'border-red-200 dark:border-red-800',
      label: '  Cancelled  ',
    },
    rejected: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-400',
      dot: 'bg-red-500 dark:bg-red-400',
      border: 'border-red-200 dark:border-red-800',
      label: '  Rejected   ',
    },
  } as const,

  // ─── ROLE BADGES ────────────────────────────────────────────────────────────
  role: {
    student: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      label: 'Student',
    },
    staff: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      label: 'Staff',
    },
    clerk: {
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      text: 'text-cyan-700 dark:text-cyan-400',
      border: 'border-cyan-200 dark:border-cyan-800',
      label: 'Clerk',
    },
    technician: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      label: 'Technician',
    },
    supervisor: {
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      text: 'text-violet-700 dark:text-violet-400',
      border: 'border-violet-200 dark:border-violet-800',
      label: 'Supervisor',
    },
    admin: {
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800',
      label: 'Admin',
    },
  } as const,

  // ─── PRIORITY BADGES ────────────────────────────────────────────────────────
  priority: {
    emergency: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      label: 'Emergency',
    },
    high: {
      bg: 'bg-amber-100 dark:bg-amber-900/20',
      text: 'text-amber-800 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      label: 'High',
    },
    normal: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      label: 'Normal',
    },
    low: {
      bg: 'bg-slate-100 dark:bg-slate-900/20',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-800',
      label: 'Low',
    },
  } as const,

  // ─── REQUEST TYPE BADGES ────────────────────────────────────────────────────
  requestType: {
    rmr: {
      bg: 'bg-sky-50 dark:bg-sky-900/20',
      text: 'text-sky-700 dark:text-sky-400',
      border: 'border-sky-200 dark:border-sky-800',
      label: 'R&M',
      fullLabel: 'FM-GSO-09 · R&M',
    },
    ppsr: {
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      text: 'text-violet-700 dark:text-violet-400',
      border: 'border-violet-200 dark:border-violet-800',
      label: 'PPSR',
      fullLabel: 'FM-GSO-15 · PPSR',
    },
  } as const,

  // ─── SIGNUP STATUS BADGES ───────────────────────────────────────────────────
  signupStatus: {
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      label: 'Pending',
    },
    approved: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      label: 'Approved',
    },
    rejected: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      label: 'Rejected',
    },
  } as const,

  // ─── TIMELINE COLORS (For StatusDot/Timeline Components) ───────────────────
  timeline: {
    completed: {
      dot: 'bg-emerald-100 dark:bg-emerald-900/30',
      border: 'border-emerald-400 dark:border-emerald-600',
      icon: 'text-emerald-600 dark:text-emerald-400',
    },
    cancelled: {
      dot: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-400 dark:border-red-600',
      icon: 'text-red-600 dark:text-red-400',
    },
    pending: {
      dot: 'bg-slate-100 dark:bg-slate-800',
      border: 'border-slate-300 dark:border-slate-600',
      icon: 'text-slate-500 dark:text-slate-400',
    },
  } as const,
} as const;

// ─── BADGE CONTAINER STANDARD SIZING ────────────────────────────────────────
/**
 * Standard badge dimensions for consistency across the project.
 * Used by all badge components to ensure uniform appearance.
 */
export const BADGE_SIZING = {
  // Container padding (horizontal and vertical)
  padding: 'px-3 py-1.5',
  // Alternative compact sizing
  compact: 'px-2.5 py-1',
  // Border radius - always full
  radius: 'rounded-full',
  // Text styles
  fontSize: 'text-xs',
  fontWeight: 'font-medium',
  // Icon/dot sizing
  dot: {
    size: 'w-2 h-2',
    compact: 'w-1.5 h-1.5',
  },
  // Gap between icon and text
  gap: 'gap-2',
  compact_gap: 'gap-1.5',
  // Whitespace handling
  whitespace: 'whitespace-nowrap',
} as const;

// ─── EXPORT HELPER TYPES ────────────────────────────────────────────────────
export type StatusType = keyof typeof BADGE_STYLES.status;
export type RoleType = keyof typeof BADGE_STYLES.role;
export type PriorityType = keyof typeof BADGE_STYLES.priority;
export type RequestTypeType = keyof typeof BADGE_STYLES.requestType;
export type SignupStatusType = keyof typeof BADGE_STYLES.signupStatus;
