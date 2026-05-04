//lib/utils/status.ts
/**
 * STATUS UTILITY FUNCTIONS
 * ─────────────────────────────────────────────────────────────────────────────
 * Helper functions for status management.
 * 
 * NOTE: For styling, use BADGE_STYLES from lib/constants/badge-styles.ts instead!
 * This provides centralized, consistent styling across the entire application.
 * 
 * These utility functions handle status transitions and terminal state checks.
 */

import { STATUS_TRANSITIONS, TERMINAL_STATUSES } from '@/lib/constants/statuses';
import type { StatusName } from '@/lib/constants/statuses';

/**
 * Get valid next statuses for a given current status.
 * Useful for determining which transitions are allowed in the UI.
 */
export function getValidNextStatuses(currentStatus: string): StatusName[] {
  return STATUS_TRANSITIONS[currentStatus as StatusName] ?? [];
}

/**
 * Check if a status is terminal (no further transitions possible).
 * Terminal statuses: 'completed', 'cancelled'
 */
export function isTerminal(status: string): boolean {
  return TERMINAL_STATUSES.includes(status as StatusName);
}

/**
 * @deprecated Use BADGE_STYLES from lib/constants/badge-styles.ts instead
 * Kept for backward compatibility only.
 */
export const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  pending:      { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  under_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  approved:     { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  assigned:     { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  in_progress:  { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  completed:    { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  cancelled:    { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  rejected:     { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
};

/**
 * @deprecated Use BADGE_STYLES from lib/constants/badge-styles.ts instead
 * Kept for backward compatibility only.
 */
export const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  emergency: { bg: 'bg-red-100', text: 'text-red-800' },
  high:      { bg: 'bg-amber-100', text: 'text-amber-800' },
  normal:    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  low:       { bg: 'bg-slate-100', text: 'text-slate-600' },
};