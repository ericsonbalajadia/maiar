'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type UserActionState = {
  error?: string
  success?: boolean
}

// -------------------- approveUser --------------------
export async function approveUser(userId: string): Promise<UserActionState> {
  // Get the current user (the admin performing the action)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify the caller is an admin using the admin client (bypass RLS)
  const admin = createAdminClient()
  const { data: caller } = await admin
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (caller?.role !== 'admin') {
    return { error: 'Only administrators can approve users' }
  }

  // Get the admin's own user ID (to set as reviewed_by)
  const { data: adminRecord } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  // Update the target user's status to approved
  const { error } = await admin
    .from('users')
    .update({
      signup_status: 'approved',
      reviewed_by: adminRecord?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users/pending')
  return { success: true }
}

// -------------------- rejectUser --------------------
export async function rejectUser(userId: string): Promise<UserActionState> {
  // Same authentication and authorization checks as approveUser
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const admin = createAdminClient()
  const { data: caller } = await admin
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (caller?.role !== 'admin') {
    return { error: 'Only administrators can reject users' }
  }

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

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users/pending')
  return { success: true }
}