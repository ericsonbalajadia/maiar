'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { DbUser } from '@/types/models'

export type UserActionState = {
  error?: string
  success?: boolean
}

export type PaginatedUsers = {
  data: DbUser[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export type UserFilters = {
  role?: string
  signup_status?: string
  is_active?: boolean
  page?: number
  pageSize?: number
}

// ─── Guard: verify caller is admin ───────────────────────────────────────────

async function verifyAdmin(): Promise<{ adminId: string; publicId: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: caller } = await admin
    .from('users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single()

  if (caller?.role !== 'admin') return null
  return { adminId: user.id, publicId: caller.id }
}

// ─── approveUser ──────────────────────────────────────────────────────────────

export async function approveUser(userId: string): Promise<UserActionState> {
  const caller = await verifyAdmin()
  if (!caller) return { error: 'Only administrators can approve users' }

  const admin = createAdminClient()

  // Get target user's auth_id
  const { data: targetUser } = await admin
    .from('users')
    .select('auth_id')
    .eq('id', userId)
    .single()
  if (!targetUser?.auth_id) return { error: 'User not found' }

  // Check email confirmation
  const { data: authUser, error: authError } = await admin.auth.admin.getUserById(
    targetUser.auth_id
  )
  if (authError || !authUser.user) {
    return { error: 'Could not verify email confirmation status' }
  }
  if (!authUser.user.email_confirmed_at) {
    return {
      error:
        'User has not confirmed their email yet. Please ask them to click the confirmation link first.',
    }
  }

  const { error } = await admin
    .from('users')
    .update({
      signup_status: 'approved',
      reviewed_by: caller.publicId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  revalidatePath('/admin/users/pending')
  revalidatePath('/admin')
  return { success: true }
}

// ─── rejectUser ───────────────────────────────────────────────────────────────

export async function rejectUser(userId: string): Promise<UserActionState> {
  const caller = await verifyAdmin()
  if (!caller) return { error: 'Only administrators can reject users' }

  const admin = createAdminClient()

  const { error } = await admin
    .from('users')
    .update({
      signup_status: 'rejected',
      reviewed_by: caller.publicId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  revalidatePath('/admin/users/pending')
  revalidatePath('/admin')
  return { success: true }
}

// ─── updateUserRole ───────────────────────────────────────────────────────────

export async function updateUserRole(
  userId: string,
  role: string
): Promise<UserActionState> {
  const caller = await verifyAdmin()
  if (!caller) return { error: 'Only administrators can change user roles' }

  const validRoles = ['student', 'staff', 'clerk', 'technician', 'supervisor', 'admin']
  if (!validRoles.includes(role)) {
    return { error: `Invalid role: ${role}` }
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  revalidatePath('/admin')
  return { success: true }
}

// ─── toggleUserActive ─────────────────────────────────────────────────────────

export async function toggleUserActive(
  userId: string,
  isActive: boolean
): Promise<UserActionState> {
  const caller = await verifyAdmin()
  if (!caller) return { error: 'Only administrators can activate or deactivate users' }

  const admin = createAdminClient()

  const { error } = await admin
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  revalidatePath('/admin')
  return { success: true }
}

// ─── getAllUsers (Admin) ───────────────────────────────────────────────────────

export async function getAllUsers(
  filters: UserFilters = {}
): Promise<PaginatedUsers> {
  const empty: PaginatedUsers = {
    data: [],
    count: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  }

  const caller = await verifyAdmin()
  if (!caller) return empty

  const admin = createAdminClient()
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = admin
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.role) {
    query = query.eq('role', filters.role)
  }

  if (filters.signup_status) {
    query = query.eq('signup_status', filters.signup_status)
  }

  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('getAllUsers error:', error)
    return empty
  }

  return {
    data: (data ?? []) as DbUser[],
    count: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

// ─── getPendingUsers ──────────────────────────────────────────────────────────

export async function getPendingUsers(): Promise<DbUser[]> {
  const caller = await verifyAdmin()
  if (!caller) return []

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('users')
    .select('*')
    .eq('signup_status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getPendingUsers error:', error)
    return []
  }

  return (data ?? []) as DbUser[]
}