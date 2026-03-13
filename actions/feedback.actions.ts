// actions/feedback.actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { feedbackSchema } from '@/lib/validations/feedback.schema';
import { actionFormError, actionError, type ActionResult } from '@/lib/utils/errors';
import { revalidatePath } from 'next/cache';

export async function submitFeedback(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return actionError('form', 'Unauthorized.');

  // Parse with type coercion for numeric rating fields
  const result = feedbackSchema.safeParse({
    request_id: formData.get('request_id'),
    service_satisfaction: Number(formData.get('service_satisfaction')),
    overall_rating: Number(formData.get('overall_rating')),
    comments: formData.get('comments') || undefined,
    is_anonymous: formData.get('is_anonymous') === 'true',
  });
  if (!result.success)
    return { success: false, errors: result.error.flatten().fieldErrors };

  const { data: requester } = await admin
    .from('users').select('id').eq('auth_id', user.id).single();
  if (!requester) return actionError('form', 'User record not found.');

  // DB function can_submit_feedback validates:
  // 1. Request must be completed
  // 2. No existing feedback row
  // 3. Within 30-day feedback window
  const { data: canSubmit, error: rpcError } = await admin.rpc('can_submit_feedback', {
    p_request_id: result.data.request_id,
    p_user_id: requester.id,
  });
  if (rpcError) return actionFormError(rpcError);
  if (!canSubmit)
    return actionError('form', 'Feedback cannot be submitted. The request may not be completed, may already have feedback, or the 30-day window has passed.');

  const { error } = await admin.from('feedbacks').insert({
    request_id: result.data.request_id,
    requester_id: requester.id,
    service_satisfaction: result.data.service_satisfaction,
    overall_rating: result.data.overall_rating,
    comments: result.data.comments ?? null,
    is_anonymous: result.data.is_anonymous,
  });
  if (error) return actionFormError(error);

  revalidatePath(`/requester/requests/${result.data.request_id}`);
  return { success: true };
}