    // actions/approve-user.action.ts
    'use server'

    import { createClient } from '@/lib/supabase/server'
    import { canApproveRole } from '@/lib/rbac'
    import { notifyAccountByEmail } from '@/lib/notifications/account-email'
    import { revalidatePath } from 'next/cache'

    export type UserActionState = {
    success?: boolean
    error?: string
    }

    export async function approveUser(targetUserId: string) {
    const supabase = await createClient()
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
    const { data: target } = await supabase
        .from('users')
        .select('id, role, signup_status')
        .eq('id', targetUserId)
        .single()

    if (!target) return { error: 'User not found' }
    if (target.signup_status === 'approved') return { error: 'Already approved' }

    // Check permission
    const canApprove = canApproveRole(approver.role, target.role)
    if (!canApprove) return { error: 'You cannot approve this role' }

    const { error } = await supabase
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

    const { data: target } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', targetUserId)
        .single()

    if (!target) return { error: 'User not found' }

    const canApprove = canApproveRole(approver.role, target.role)
    if (!canApprove) return { error: 'You cannot reject this role' }

    const { error } = await supabase
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