'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type UserActionState = {
  error?: string
  success?: boolean
}

// -------------------- approveUser (with email confirmation check) --------------------
export async function approveUser(userId: string): Promise<UserActionState> {
  // 1. Verify the caller is an admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const admin = createAdminClient()
  const { data: caller } = await admin
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()
  if (caller?.role !== 'admin') return { error: 'Only administrators can approve users' }

  // 2. Get the target user's auth_id from public.users
  const { data: targetUser } = await admin
    .from('users')
    .select('auth_id')
    .eq('id', userId)
    .single()
  if (!targetUser?.auth_id) return { error: 'User not found' }

  // 3. Check email confirmation status in auth.users
  const { data: authUser, error: authError } = await admin.auth.admin.getUserById(
    targetUser.auth_id
  )
  if (authError || !authUser.user) {
    return { error: 'Could not verify email confirmation status' }
  }
  if (!authUser.user.email_confirmed_at) {
    return {
      error: 'User has not confirmed their email yet. Please ask them to click the confirmation link first.',
    }
  }

  // 4. Get admin's own user ID (to set as reviewed_by)
  const { data: adminRecord } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  // 5. Update the target user's status to approved
  const { error } = await admin
    .from('users')
    .update({
      signup_status: 'approved',
      reviewed_by: adminRecord?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users/pending')
  return { success: true }
}

// -------------------- rejectUser --------------------
export async function rejectUser(userId: string): Promise<UserActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const admin = createAdminClient()
  const { data: caller } = await admin
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()
  if (caller?.role !== 'admin') return { error: 'Only administrators can reject users' }

  const { data: adminRecord } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  const { error } = await admin
    .from('users')
    .update({
      signup_status: 'rejected',
      reviewed_by: adminRecord?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users/pending')
  return { success: true }
}