// actions/accomplishment.actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { saveAccomplishmentSchema, verifyAccomplishmentSchema } from '@/lib/validations/accomplishment.schema';
import { actionFormError, actionError, type ActionResult } from '@/lib/utils/errors';
import {
  ACCOMPLISHMENT_RECORD_ROLES,
  SUPERVISOR_ASSIGNMENT_ROLES,
  hasRole,
} from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

export async function saveAccomplishment(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return actionError('form', 'Unauthorized.');

  const result = saveAccomplishmentSchema.safeParse(Object.fromEntries(formData));
  if (!result.success)
    return { success: false, errors: result.error.flatten().fieldErrors };

  const { data: actor } = await admin
    .from('users').select('id, role').eq('auth_id', user.id).single();
  if (!actor || !hasRole(actor.role, ACCOMPLISHMENT_RECORD_ROLES))
    return actionError('form', 'Only technicians and supervisors can record accomplishments.');

  // Upsert: one accomplishments row per request (UNIQUE on request_id)
  const { error } = await admin.from('accomplishments').upsert({
    request_id: result.data.request_id,
    conducted_by: actor.id,
    started_at: result.data.started_at ?? null,
    finished_at: result.data.finished_at ?? null,
    notes: result.data.notes ?? null,
  }, { onConflict: 'request_id' });

  if (error) return actionFormError(error);

  revalidatePath('/technician');
  return { success: true };
}


export async function verifyAccomplishment(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return actionError('form', 'Unauthorized.');

  const result = verifyAccomplishmentSchema.safeParse(Object.fromEntries(formData));
  if (!result.success)
    return { success: false, errors: result.error.flatten().fieldErrors };

  // Only supervisors and admins can verify (act as GenSO Head)
  const { data: head } = await admin
    .from('users').select('id, role').eq('auth_id', user.id).single();
  if (!head || !hasRole(head.role, SUPERVISOR_ASSIGNMENT_ROLES))
    return actionError('form', 'Only supervisors can verify completed work.');

  // Ensure the accomplishments row exists and has finished_at set
  const { data: existing } = await admin
    .from('accomplishments')
    .select('id, finished_at')
    .eq('request_id', result.data.request_id)
    .single();
  if (!existing)
    return actionError('form', 'No work record found for this request. The technician must record work details first.');
  if (!existing.finished_at)
    return actionError('form', 'Work finish time must be recorded before verification.');

  // Setting verified_by triggers on_accomplishment_verified:
  // - status = 'completed', actual_completion_date = finished_at::DATE
  // - verified_at = NOW()
  // - on_completion_notify_requester fires after
  const { error } = await admin
    .from('accomplishments')
    .update({
      verified_by: head.id,
      verified_at: new Date().toISOString(),
      notes: result.data.notes ?? null,
    })
    .eq('id', existing.id);

  if (error) return actionFormError(error);

  revalidatePath('/supervisor');
  revalidatePath(`/requester/requests/${result.data.request_id}`);
  return { success: true };
}