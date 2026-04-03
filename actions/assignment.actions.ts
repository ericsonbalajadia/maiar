// actions/assignment.actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assignmentSchema, acceptanceSchema } from '@/lib/validations/assignment.schema';
import { actionFormError, actionError, type ActionResult } from '@/lib/utils/errors';
import { ROLES, SUPERVISOR_ASSIGNMENT_ROLES, hasRole } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';


export async function assignTechnician(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return actionError('form', 'Unauthorized.');

  const result = assignmentSchema.safeParse(Object.fromEntries(formData));
  if (!result.success)
    return { success: false, errors: result.error.flatten().fieldErrors };

  const { data: supervisor } = await admin
    .from('users').select('id, role').eq('auth_id', user.id).single();
  if (!supervisor || !hasRole(supervisor.role, SUPERVISOR_ASSIGNMENT_ROLES))
    return actionError('form', 'Only supervisors can assign technicians.');

  // TODO: Replace this with a DB-level UNIQUE partial index once the
  // follow-up migration is applied:
  // CREATE UNIQUE INDEX idx_assignments_one_active
  // ON request_assignments (request_id)
  // WHERE is_current_assignment = TRUE;
  // Until then, this UPDATE + INSERT is not fully atomic.
  await admin
    .from('request_assignments')
    .update({ is_current_assignment: false })
    .eq('request_id', result.data.request_id)
    .eq('is_current_assignment', true);

  // Insert new assignment – enforce_technician_role trigger validates role
  const { error: assignError } = await admin.from('request_assignments').insert({
    request_id: result.data.request_id,
    assigned_user_id: result.data.assigned_user_id,
    assigned_by: supervisor.id,
    notes: result.data.notes ?? null,
    is_current_assignment: true,
    acceptance_status: 'pending',
  });
  if (assignError) return actionFormError(assignError);

  // Update denormalized field and status on requests
  const { data: assignedStatus } = await admin
    .from('statuses').select('id').eq('status_name', 'assigned').single();
  if (!assignedStatus) return actionError('form', 'System error: status not found.');

  const { error: reqError } = await admin
    .from('requests')
    .update({
      status_id: assignedStatus.id,
      assigned_technician_id: result.data.assigned_user_id,
    })
    .eq('id', result.data.request_id);
  if (reqError) return actionFormError(reqError);

  revalidatePath('/supervisor');
  revalidatePath(`/supervisor/requests/${result.data.request_id}`);
  return { success: true };
}


export async function updateAcceptanceStatus(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return actionError('form', 'Unauthorized.');

  const result = acceptanceSchema.safeParse(Object.fromEntries(formData));
  if (!result.success)
    return { success: false, errors: result.error.flatten().fieldErrors };

  const { data: technician } = await admin
    .from('users').select('id, role, full_name').eq('auth_id', user.id).single();
  if (!technician || technician.role !== ROLES.TECHNICIAN)
    return actionError('form', 'Only technicians can update acceptance status.');

  // Verify the assignment belongs to this technician
  const { data: assignment } = await admin
    .from('request_assignments')
    .select('id, request_id, assigned_by')
    .eq('id', result.data.assignment_id)
    .eq('assigned_user_id', technician.id)
    .single();
  if (!assignment) return actionError('form', 'Assignment not found.');

  const { error } = await admin
    .from('request_assignments')
    .update({ acceptance_status: result.data.acceptance_status })
    .eq('id', result.data.assignment_id)
    .eq('assigned_user_id', technician.id);
  if (error) return actionFormError(error);

  // If rejected: notify the assigning supervisor
  if (result.data.acceptance_status === 'rejected') {
    const { data: requestRow } = await admin
      .from('requests').select('ticket_number').eq('id', assignment.request_id).single();
    await admin.from('notifications').insert({
      user_id: assignment.assigned_by,
      request_id: assignment.request_id,
      type: 'status_updated',
      subject: `Assignment rejected - ${requestRow?.ticket_number ?? 'request'}`,
      message: `${technician.full_name} rejected the assignment for request ${requestRow?.ticket_number ?? ''}. Please reassign.`,
    });
  }

  // If accepted: move request to in_progress
  if (result.data.acceptance_status === 'accepted') {
    const { data: inProgressStatus } = await admin
      .from('statuses').select('id').eq('status_name', 'in_progress').single();
    if (inProgressStatus) {
      await admin.from('requests')
        .update({ status_id: inProgressStatus.id })
        .eq('id', assignment.request_id);
    }
  }

  revalidatePath('/technician');
  return { success: true };
}