'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';
import { AssignTechnicianSchema } from '@/lib/validations/assignment.schema';

type ActionResult = { success: boolean; error?: string };

/**
 * Assigns a technician to a request.
 * - Only supervisor / admin may call this.
 * - Creates a request_assignments row.
 * - Updates request status to 'assigned' if currently 'approved'.
 * - Queues an in-app notification for the technician.
 */
export async function assignTechnician(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const serviceSupabase = createServiceClient();

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthenticated' };

  // 2. Role check via service client (avoids RLS recursion)
  const { data: actor } = await serviceSupabase
    .from('users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single();

  if (!actor || !['supervisor', 'admin'].includes(actor.role)) {
    return { success: false, error: 'Unauthorized: supervisor or admin role required' };
  }

  // 3. Validate input
  const raw = {
    requestId: formData.get('requestId') as string,
    technicianId: formData.get('technicianId') as string,
    notes: formData.get('notes') as string | undefined,
  };
  const parsed = AssignTechnicianSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const { requestId, technicianId, notes } = parsed.data;

  // 4. Verify request is in an assignable state
  const { data: request } = await serviceSupabase
    .from('requests')
    .select('id, status_id, statuses ( status_name )')
    .eq('id', requestId)
    .single();
  const currentStatus = (request?.statuses as any)?.status_name;
  if (!['approved', 'assigned'].includes(currentStatus)) {
    return { success: false, error: `Request must be approved or assigned to reassign. Current: ${currentStatus}` };
  }

// 5. Mark any existing active assignment as not current and completed
await serviceSupabase
  .from('request_assignments')
  .update({ 
    completed_at: new Date().toISOString(),
    is_current_assignment: false 
  })
  .eq('request_id', requestId)
  .eq('is_current_assignment', true);

  // 6. Create new assignment
  const { error: insertError } = await serviceSupabase
    .from('request_assignments')
    .insert({
      request_id: requestId,
      assigned_user_id: technicianId,
      assigned_by: actor.id,
      notes: notes || null,
      is_current_assignment: true,
      acceptance_status: 'pending',
    });

  if (insertError) {
    console.error('[assignTechnician] insert error:', insertError.message);
    return { success: false, error: 'Failed to create assignment: ' + insertError.message };
  }

  // 7. Update request status to 'assigned' and denormalized field
  const { data: assignedStatus } = await serviceSupabase
    .from('statuses')
    .select('id')
    .eq('status_name', 'assigned')
    .single();

  if (assignedStatus) {
    await serviceSupabase
      .from('requests')
      .update({
        status_id: assignedStatus.id,
        assigned_technician_id: technicianId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);
  }

  // 8. Queue in-app notification for technician (non-blocking)
  try {
    const { data: reqInfo } = await serviceSupabase
      .from('requests')
      .select('ticket_number, title')
      .eq('id', requestId)
      .single();

    await serviceSupabase.from('notifications').insert({
      user_id: technicianId,
      request_id: requestId,
      type: 'request_assigned',
      subject: `New Assignment: ${reqInfo?.ticket_number}`,
      message: `You have been assigned to "${reqInfo?.title}". Please review and schedule.`,
      status: 'pending',
    });
  } catch (notifErr) {
    console.warn('[assignTechnician] notification insert failed (non-fatal):', notifErr);
  }

  revalidatePath('/supervisor');
  revalidatePath(`/supervisor/requests/${requestId}`);
  return { success: true };
}