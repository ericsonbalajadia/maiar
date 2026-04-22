//actions/supervisor/supervisor-status.actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';
import { SUPERVISOR_ALLOWED_TRANSITIONS } from '@/lib/constants/statuses';
import { SupervisorStatusUpdateSchema } from '@/lib/validations/supervisor-status.schema';

type ActionResult = { success: boolean; error?: string };

// Helper to get all user IDs for a given role
async function getUserIdsByRole(role: 'clerk' | 'supervisor' | 'admin'): Promise<string[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('role', role)
    .eq('signup_status', 'approved');
  return data?.map(u => u.id) ?? [];
}

export async function updateRequestStatusBySupervisor(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
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

  if (!raw.requestId || !raw.newStatus) {
    return { success: false, error: 'Request ID and new status are required' };
  }

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

  // ─── 1. Notify the requester of status change ────────────────────────────
  try {
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

    if (request?.requester_id && typeMap[newStatus]) {
      await serviceSupabase.from('notifications').insert({
        user_id: request.requester_id,
        request_id: requestId,
        type: typeMap[newStatus],
        subject: `Request ${request?.ticket_number} – ${newStatus.replace('_', ' ')}`,
        message: msgMap[newStatus] ?? `Status updated to ${newStatus}.`,
        read_at: null,   // unread
        created_at: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn('[updateRequestStatusBySupervisor] requester notification failed:', e);
  }

  // ─── 2. Notify all clerks when request is completed or cancelled ─────────
  if (newStatus === 'completed' || newStatus === 'cancelled') {
    try {
      const clerkIds = await getUserIdsByRole('clerk');
      if (clerkIds.length > 0) {
        const typeForStaff = newStatus === 'completed' ? 'request_completed' : 'request_cancelled';
        const staffMsg = newStatus === 'completed'
          ? `Request ${request?.ticket_number} has been completed.`
          : `Request ${request?.ticket_number} has been cancelled.${notes ? ` Reason: ${notes}` : ''}`;
        await serviceSupabase.from('notifications').insert(
          clerkIds.map(userId => ({
            user_id: userId,
            request_id: requestId,
            type: typeForStaff,
            subject: `Request ${request?.ticket_number} – ${newStatus}`,
            message: staffMsg,
            read_at: null,
            created_at: new Date().toISOString(),
          }))
        );
      }
    } catch (e) {
      console.warn('[updateRequestStatusBySupervisor] clerk notification failed:', e);
    }
  }

  // Revalidate paths
  revalidatePath('/supervisor');
  revalidatePath(`/supervisor/requests/${requestId}`);
  revalidatePath('/clerk');
  revalidatePath(`/clerk/requests/${requestId}`);
  revalidatePath(`/requester/requests/${requestId}`);

  return { success: true };
}