// actions/clerk/clerk-status.actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ClerkStatusUpdateSchema } from '@/lib/validations/clerk-status.schema';
import { CLERK_ALLOWED_TRANSITIONS } from '@/lib/constants/statuses';
import { getUserIdsByRole, sendBulkNotification } from '@/actions/notifications/notifications.actions';

export async function updateRequestStatusByClerk(
  requestId: string,
  newStatus: string,
  notes?: string
) {
  const supabase = await createClient();

  // 1. Validate input
  const parsed = ClerkStatusUpdateSchema.safeParse({ requestId, newStatus, notes });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // 2. Verify caller is an approved clerk (or supervisor/admin)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized: not authenticated.' };

  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (userError || !userRecord) return { error: 'User role not found.' };
  const role = userRecord.role;

  if (role !== 'clerk' && role !== 'supervisor' && role !== 'admin') {
    return { error: 'Unauthorized: clerk role required.' };
  }

  // 3. Fetch current status
  const { data: req, error: fetchErr } = await supabase
    .from('requests')
    .select('status_id, statuses!inner(status_name)')
    .eq('id', requestId)
    .single();

  if (fetchErr || !req) return { error: 'Request not found.' };
  const currentStatus = (req.statuses as { status_name: string }).status_name;

  // 4. Guard: is this transition allowed for the clerk?
  const allowed = CLERK_ALLOWED_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    return { error: `Cannot transition from '${currentStatus}' to '${newStatus}'.` };
  }

  // 5. Approved / Rejected → delegate to review flow
if (newStatus === 'approved' || newStatus === 'rejected') {
  const { data: reviewer } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!reviewer) return { error: 'Reviewer not found.' };

  const { error: reviewError } = await supabase
    .from('request_reviews')
    .insert({
      request_id: requestId,
      reviewer_id: reviewer.id,
      decision: newStatus,
      review_notes: notes ?? null,
      reviewed_at: new Date().toISOString(),
    });

  if (reviewError) return { error: `Failed to save review: ${reviewError.message}` };

  const { data: statusRow } = await supabase
    .from('statuses')
    .select('id')
    .eq('status_name', newStatus)
    .single();

  if (statusRow) {
    await supabase
      .from('requests')
      .update({ status_id: statusRow.id, updated_at: new Date().toISOString() })
      .eq('id', requestId);
  }

  // ✅ Fetch request title and ticket number
  const { data: requestInfo } = await supabase
    .from('requests')
    .select('title, ticket_number')
    .eq('id', requestId)
    .single();

  if (requestInfo) {
    const supervisorIds = await getUserIdsByRole('supervisor');
    await sendBulkNotification({
      userIds: supervisorIds,
      requestId: requestId,
      type: newStatus === 'approved' ? 'request_approved' : 'request_rejected',
      subject: `Request ${newStatus} by clerk`,
      message: `Request "${requestInfo.title}" (${requestInfo.ticket_number}) has been ${newStatus}.`,
    });
  }

  revalidatePath('/clerk');
  revalidatePath(`/clerk/requests/${requestId}/review`);
  return { success: true, newStatus };
}

  // 6. Fetch target status ID
  const { data: statusRow } = await supabase
    .from('statuses')
    .select('id')
    .eq('status_name', newStatus)
    .single();

  if (!statusRow) return { error: 'Invalid target status.' };

  // 7. Update request status
  const { error: updateErr } = await supabase
    .from('requests')
    .update({ status_id: statusRow.id, updated_at: new Date().toISOString() })
    .eq('id', requestId);

  if (updateErr) return { error: updateErr.message };

  // 8. Revalidate pages
  revalidatePath('/clerk');
  revalidatePath(`/clerk/requests/${requestId}/review`);

  return { success: true, newStatus };
}