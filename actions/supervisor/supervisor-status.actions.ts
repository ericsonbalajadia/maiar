'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';
import { SUPERVISOR_ALLOWED_TRANSITIONS } from '@/lib/constants/statuses';
import { SupervisorStatusUpdateSchema } from '@/lib/validations/supervisor-status.schema';

type ActionResult = { success: boolean; error?: string };

export async function updateRequestStatusBySupervisor(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
    console.log('[Action] FormData entries:');
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}:`, value);
  }
  const supabase = await createClient();
  const serviceSupabase = createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthenticated' };

  const { data: actor } = await serviceSupabase
    .from('users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single();

  if (!actor || !['supervisor', 'admin'].includes(actor.role)) {
    return { success: false, error: 'Unauthorized: supervisor or admin role required' };
  }

  const raw = {
  requestId: formData.get('requestId') as string | null,
  newStatus: formData.get('newStatus') as string | null,
  notes: formData.get('notes') as string | null | undefined,
};

console.log('[Action] Raw extracted values:', raw);

if (!raw.requestId || !raw.newStatus) {
  return { success: false, error: 'Request ID and new status are required' };
}

// Then parse with Zod, but ensure strings are not empty
const parsed = SupervisorStatusUpdateSchema.safeParse({
  requestId: raw.requestId,
  newStatus: raw.newStatus,
  notes: raw.notes ?? undefined,
});
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { requestId, newStatus, notes } = parsed.data;

  // Fetch current request and requester info
  const { data: request } = await serviceSupabase
    .from('requests')
    .select('id, status_id, requester_id, ticket_number, title, statuses ( status_name )')
    .eq('id', requestId)
    .single();

  const currentStatus = (request?.statuses as any)?.status_name as string;
  const allowed = SUPERVISOR_ALLOWED_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    return { success: false, error: `Transition ${currentStatus} → ${newStatus} is not permitted` };
  }

  const { data: statusRow } = await serviceSupabase
    .from('statuses')
    .select('id')
    .eq('status_name', newStatus)
    .single();

  if (!statusRow) {
    return { success: false, error: `Status '${newStatus}' not found` };
  }

  const updatePayload: Record<string, unknown> = {
    status_id: statusRow.id,
    updated_at: new Date().toISOString(),
  };
  if (newStatus === 'completed') {
    updatePayload.actual_completion_date = new Date().toISOString();
  }

  const { error: updateError } = await serviceSupabase
    .from('requests')
    .update(updatePayload)
    .eq('id', requestId);

  if (updateError) {
    return { success: false, error: 'Failed to update: ' + updateError.message };
  }

  if (newStatus === 'completed') {
    await serviceSupabase
      .from('request_assignments')
      .update({ completed_at: new Date().toISOString() })
      .eq('request_id', requestId)
      .is('completed_at', null);
  }

  // Notify requester of status change
  try {
    console.log('[Action] Attempting to send notification for status:', newStatus);
    console.log('[Action] Requester ID:', request?.requester_id);
    
    const typeMap: Record<string, string> = {
      in_progress: 'request_assigned',
      completed: 'request_completed',
      cancelled: 'request_cancelled',
    };
    const msgMap: Record<string, string> = {
      in_progress: `Repair work has started on your request "${request?.title}".`,
      completed: `Your request "${request?.title}" has been completed.`,
      cancelled: `Your request "${request?.title}" has been cancelled.${notes ? ` Reason: ${notes}` : ''}`,
    };

    console.log('[Action] Type map value:', typeMap[newStatus]);
    console.log('[Action] Message map value:', msgMap[newStatus]);
    if (request?.requester_id && typeMap[newStatus]) {
      await serviceSupabase.from('notifications').insert({
        user_id: request.requester_id,
        request_id: requestId,
        type: typeMap[newStatus],
        subject: `Request ${request?.ticket_number} -- ${newStatus.replace('_', ' ')}`,
        message: msgMap[newStatus] ?? `Status updated to ${newStatus}.`,
        status: 'pending',
      });
    }
  } catch (e) {
    console.error('[Action] Notification failed:', e);
    console.warn('[updateRequestStatusBySupervisor] notification failed:', e);
  }

  revalidatePath('/supervisor');
  revalidatePath(`/supervisor/requests/${requestId}`);
  revalidatePath(`/requester/requests/${requestId}`);

  console.log('[Action] Status update successful for request:', requestId, 'new status:', newStatus);
  return { success: true };
}