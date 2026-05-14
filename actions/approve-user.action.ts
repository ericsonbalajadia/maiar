// actions/approve-user.action.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { canApproveRole } from '@/lib/rbac'
import { notifyAccountByEmail } from '@/lib/notifications/account-email'
import { revalidatePath } from 'next/cache'
import { sendBulkNotification, getUserIdsByRole } from './notifications/notifications.actions'   // added

export type UserActionState = {
  success?: boolean
  error?: string
}

export async function approveUser(targetUserId: string) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get approver's profile
  const { data: approver } = await supabase
    .from('users')
    .select('id, role, signup_status')
    .eq('auth_id', user.id)
    .single()

  if (!approver || approver.signup_status !== 'approved') {
    return { error: 'Not authorized' }
  }

  // Get target user's role
  const { data: target } = await admin
    .from('users')
    .select('id, role, signup_status, full_name, email')
    .eq('id', targetUserId)
    .maybeSingle()

  if (!target) return { error: 'User not found or inaccessible.' }
  if (target.signup_status === 'approved') return { error: 'Already approved' }
  if (target.signup_status !== 'pending') return { error: 'User is no longer pending approval.' }

  // Check permission
  const canApprove = canApproveRole(approver.role, target.role)
  if (!canApprove) return { error: 'You cannot approve this role' }

  const { error } = await admin
    .from('users')
    .update({
      signup_status: 'approved',
      reviewed_by: approver.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', targetUserId)

  if (error) return { error: error.message }

  console.log('[approveUser] Sending notifications for user:', targetUserId);
  const clerkIds = await getUserIdsByRole('clerk');
  console.log('[approveUser] Clerk IDs:', clerkIds);

  // ─── Send in‑app notifications ──────────────────────────────────────────
  try {
    // For the user notification
    console.log('[approveUser] Sending account_approved notification to user:', targetUserId);
    await sendBulkNotification({
      userIds: [targetUserId],
      type: 'account_approved',
      subject: 'Account Approved',
      message: `Your account has been approved. You can now log in.`,
    })
    console.log('[approveUser] Successfully sent account_approved notification');

    // 2. Notify all clerks and supervisors
    const supervisorIds = await getUserIdsByRole('supervisor');
    const staffIds = [...clerkIds, ...supervisorIds];
    console.log('[approveUser] Staff to notify - Clerks:', clerkIds.length, 'Supervisors:', supervisorIds.length);
    if (staffIds.length > 0) {
      console.log('[approveUser] Sending user_account_approved notification to staff:', staffIds);
      await sendBulkNotification({
        userIds: staffIds,
        type: 'user_account_approved',
        subject: `User approved: ${target.full_name}`,
        message: `${target.full_name} (${target.email}) has been approved as a ${target.role}.`,
      })
      console.log('[approveUser] Successfully sent user_account_approved notification');
    } else {
      console.warn('[approveUser] No staff members found to notify');
    }
  } catch (notifError) {
    console.error('❌ [approveUser] FAILED - Error sending in‑app notifications:', notifError);
    // Don't rethrow - continue with email notifications
  }
  // ────────────────────────────────────────────────────────────────────────

  try {
    await notifyAccountByEmail({
      userId: targetUserId,
      event: 'account_approved',
    })
  } catch (notifyError) {
    console.error('approveUser: failed to send approval email', {
      userId: targetUserId,
      error: notifyError,
    })
  }

  revalidatePath('/clerk')
  revalidatePath('/supervisor')
  revalidatePath('/admin')
  return { success: true }
}

export async function rejectUser(targetUserId: string, reason?: string) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: approver } = await supabase
    .from('users')
    .select('id, role, signup_status')
    .eq('auth_id', user.id)
    .single()

  if (!approver || approver.signup_status !== 'approved') {
    return { error: 'Not authorized' }
  }

  const { data: target } = await admin
    .from('users')
    .select('id, role, signup_status, full_name, email')
    .eq('id', targetUserId)
    .maybeSingle()

  if (!target) return { error: 'User not found or inaccessible.' }
  if (target.signup_status === 'approved') return { error: 'Cannot reject an already approved user.' }
  if (target.signup_status !== 'pending') return { error: 'User is no longer pending approval.' }

  const canApprove = canApproveRole(approver.role, target.role)
  if (!canApprove) return { error: 'You cannot reject this role' }

  const { error } = await admin
    .from('users')
    .update({
      signup_status: 'rejected',
      reviewed_by: approver.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', targetUserId)

  if (error) return { error: error.message }

  // ─── Send in‑app notifications ──────────────────────────────────────────
  try {
    // 1. Notify the rejected user
    console.log('[rejectUser] Sending account_rejected notification to user:', targetUserId);
    await sendBulkNotification({
      userIds: [targetUserId],
      type: 'account_rejected',
      subject: 'Account Rejected',
      message: reason
        ? `Your account registration has been rejected. Reason: ${reason}`
        : `Your account registration has been rejected. Please contact the administrator.`,
    })
    console.log('[rejectUser] Successfully sent account_rejected notification');

    // 2. Notify all clerks and supervisors
    const clerkIds = await getUserIdsByRole('clerk')
    const supervisorIds = await getUserIdsByRole('supervisor')
    const staffIds = [...clerkIds, ...supervisorIds]
    console.log('[rejectUser] Staff to notify - Clerks:', clerkIds.length, 'Supervisors:', supervisorIds.length);
    if (staffIds.length > 0) {
      console.log('[rejectUser] Sending user_account_rejected notification to staff:', staffIds);
      await sendBulkNotification({
        userIds: staffIds,
        type: 'user_account_rejected',
        subject: `User rejected: ${target.full_name}`,
        message: `${target.full_name} (${target.email}) has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      })
      console.log('[rejectUser] Successfully sent user_account_rejected notification');
    } else {
      console.warn('[rejectUser] No staff members found to notify');
    }
  } catch (notifError) {
    console.error('rejectUser: failed to send in‑app notifications', notifError);
    // Don't rethrow - continue with email notifications
  }
  // ────────────────────────────────────────────────────────────────────────

  try {
    await notifyAccountByEmail({
      userId: targetUserId,
      event: 'account_rejected',
      rejectionReason: reason,
    })
  } catch (notifyError) {
    console.error('rejectUser: failed to send rejection email', {
      userId: targetUserId,
      error: notifyError,
    })
  }

  revalidatePath('/clerk')
  revalidatePath('/supervisor')
  revalidatePath('/admin')
  return { success: true }
}