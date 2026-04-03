// actions/review.actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { reviewSchema } from '@/lib/validations/review.schema';
import { actionFormError, actionError, type ActionResult } from '@/lib/utils/errors';
import { CLERK_REVIEW_ROLES, hasRole } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

export async function startReview(requestId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return actionError('form', 'Unauthorized.');

  const { data: clerk } = await admin
    .from('users').select('id, role').eq('auth_id', user.id).single();
  if (!clerk || !hasRole(clerk.role, CLERK_REVIEW_ROLES))
    return actionError('form', 'Only clerks can review requests.');

  // Fetch both status IDs in parallel
  const [{ data: fromStatus }, { data: toStatus }] = await Promise.all([
    admin.from('statuses').select('id').eq('status_name', 'pending').single(),
    admin.from('statuses').select('id').eq('status_name', 'under_review').single(),
  ]);
  if (!fromStatus || !toStatus)
    return actionError('form', 'System error: status not found.');

  // Only transition if currently pending (idempotent if already under_review)
  const { error } = await admin
    .from('requests')
    .update({ status_id: toStatus.id })
    .eq('id', requestId)
    .eq('status_id', fromStatus.id);

  if (error) return actionFormError(error);
  revalidatePath(`/clerk/requests/${requestId}/review`);
  return { success: true };
}

export async function submitReview(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return actionError('form', 'Unauthorized.');

  // Validate input – superRefine checks review_notes for rejected/needs_info
  const raw = Object.fromEntries(formData.entries());
  const result = reviewSchema.safeParse(raw);
  if (!result.success)
    return { success: false, errors: result.error.flatten().fieldErrors };

  // Verify clerk role
  const { data: clerk } = await admin
    .from('users').select('id, role').eq('auth_id', user.id).single();
  if (!clerk || !hasRole(clerk.role, CLERK_REVIEW_ROLES))
    return actionError('form', 'Only clerks can submit reviews.');

  // Insert review row – DB trigger enforce_reviewer_role validates role again
  const { error: reviewError } = await admin.from('request_reviews').insert({
    request_id: result.data.request_id,
    reviewer_id: clerk.id,
    decision: result.data.decision,
    review_notes: result.data.review_notes ?? null,
  });
  if (reviewError) return actionFormError(reviewError);

  // Map decision to the correct status name
  const nextStatusName =
    result.data.decision === 'approved' ? 'approved' :
    result.data.decision === 'rejected' ? 'cancelled' :
    /* needs_info */ 'under_review';

  const { data: nextStatus } = await admin
    .from('statuses').select('id').eq('status_name', nextStatusName).single();
  if (!nextStatus) return actionError('form', 'System error: status not found.');

  const { error: statusError } = await admin
    .from('requests')
    .update({ status_id: nextStatus.id })
    .eq('id', result.data.request_id);
  if (statusError) return actionFormError(statusError);

  revalidatePath('/clerk');
  revalidatePath(`/clerk/requests/${result.data.request_id}/review`);
  return { success: true };
}