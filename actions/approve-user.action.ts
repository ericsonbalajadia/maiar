    // actions/approve-user.action.ts
    'use server'

    import { createClient } from '@/lib/supabase/server'
    import { createAdminClient } from '@/lib/supabase/admin'
    import { canApproveRole } from '@/lib/rbac'
    import { notifyAccountByEmail } from '@/lib/notifications/account-email'
    import { revalidatePath } from 'next/cache'

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
        .select('id, role, signup_status')
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

    try {
        await notifyAccountByEmail({
            userId: targetUserId,
            event: 'account_approved',
        });
    } catch (notifyError) {
        console.error('approveUser: failed to send approval email', {
            userId: targetUserId,
            error: notifyError,
        });
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
        .select('id, role, signup_status')
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

    try {
        await notifyAccountByEmail({
            userId: targetUserId,
            event: 'account_rejected',
            rejectionReason: reason,
        });
    } catch (notifyError) {
        console.error('rejectUser: failed to send rejection email', {
            userId: targetUserId,
            error: notifyError,
        });
    }

    revalidatePath('/clerk')
    revalidatePath('/supervisor')
    revalidatePath('/admin')
    return { success: true }
    }