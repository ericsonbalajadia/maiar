// actions/auth.actions.ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { registerSchema, loginSchema } from '@/lib/validations/user.schema'
import type { RegisterInput, LoginInput } from '@/lib/validations/user.schema'

// -------------------- registerUser --------------------
export async function registerUser(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    full_name: formData.get('full_name') as string,
    role: formData.get('role') as string,
    department: formData.get('department') as string | undefined,
  }

  // Validate with Zod
  const result = registerSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        full_name: result.data.full_name,
        role: result.data.role,
        department: result.data.department ?? null,
      },
    },
  })

  if (error) {
    return { error: { form: [error.message] } }
  }

  // Redirect to pending approval page – user cannot access system yet
  redirect('/pending-approval')
}

// -------------------- loginUser --------------------
export async function loginUser(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const result = loginSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (authError || !authData.user) {
    return { error: { form: ['Invalid email or password'] } }
  }

  // Fetch user record to check signup_status and role
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role, signup_status, is_active')
    .eq('auth_id', authData.user.id)
    .single()

  if (userError || !user) {
    await supabase.auth.signOut()
    return { error: { form: ['Account setup incomplete. Contact admin.'] } }
  }

  if (!user.is_active) {
    await supabase.auth.signOut()
    return { error: { form: ['Your account has been deactivated.'] } }
  }

  if (user.signup_status === 'pending') {
    redirect('/pending-approval')
  }

  if (user.signup_status === 'rejected') {
    await supabase.auth.signOut()
    return { error: { form: ['Your registration was rejected. Contact admin.'] } }
  }

  // Route approved users to their role dashboard
  const roleDashboards: Record<string, string> = {
    student: '/requester',
    staff: '/requester',
    clerk: '/clerk',
    technician: '/technician',
    supervisor: '/supervisor',
    admin: '/admin',
  }

  redirect(roleDashboards[user.role] ?? '/requester')
}

// -------------------- logoutUser --------------------
export async function logoutUser() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}