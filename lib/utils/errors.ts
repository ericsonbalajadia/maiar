// Central error formatter for Server Actions

interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

export function formatSupabaseError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'An unexpected error occurred. Please try again.';
  }
  const e = error as SupabaseError;

  switch (e.code) {
    // PostgreSQL error codes
    case '42501':
      return 'You do not have permission to perform this action.';
    case '23505':
      return 'This record already exists.';
    case '23503':
      return 'A referenced record does not exist.';
    case '23514':
      return 'The data did not pass a validation check.';
    case '22P02':
      return 'Invalid input format.';
    // Supabase/PostgREST error codes
    case 'PGRST116':
      return 'Record not found.';
    case 'PGRST301':
      return 'Your session has expired. Please sign in again.';
    default:
      // Surface DB trigger RAISE EXCEPTION messages directly to the user
      return e.message ?? 'An unexpected error occurred. Please try again.';
  }
}

// Typed return shape used by all Server Actions
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; errors: Record<string, string[]> };

export function actionError(field: string, message: string): ActionResult {
  return { success: false, errors: { [field]: [message] } };
}

export function actionFormError(error: unknown): ActionResult {
  return actionError('form', formatSupabaseError(error));
}