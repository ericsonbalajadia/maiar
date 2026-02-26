// actions/auth.actions.ts (excerpt)
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { registerSchema, loginSchema } from '@/lib/validations/user.schema'
import type { RegisterInput, LoginInput } from '@/lib/validations/user.schema'

// Define return types for useActionState
export type RegisterState = {
  errors?: {
    email?: string[]
    password?: string[]
    full_name?: string[]
    role?: string[]
    department?: string[]
    form?: string[]
  }
  success?: boolean
}

export type LoginState = {
  errors?: {
    email?: string[]
    password?: string[]
    form?: string[]
  }
  success?: boolean
}

export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
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
    return { errors: result.error.flatten().fieldErrors }
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
    return { errors: { form: [error.message] } }
  }

  // Success – we redirect, but useActionState expects a return.
  // However, redirect throws an error, so we need to handle it.
  // We'll use a try-catch or simply return success and handle redirect in the component?
  // Better: After success, we redirect, so the function never returns.
  // But useActionState expects a return. We'll redirect inside the action,
  // and TypeScript will complain that not all code paths return a value.
  // We can add a return after redirect (which never executes) to satisfy TypeScript.
  redirect('/pending-approval')
  // This line never runs, but needed for TypeScript
  return { success: true }
}

export async function loginUser(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const result = loginSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (authError || !authData.user) {
    return { errors: { form: ['Invalid email or password'] } }
  }

  // Fetch user record
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role, signup_status, is_active')
    .eq('auth_id', authData.user.id)
    .single()

  if (userError || !user) {
    await supabase.auth.signOut()
    return { errors: { form: ['Account setup incomplete. Contact admin.'] } }
  }

  if (!user.is_active) {
    await supabase.auth.signOut()
    return { errors: { form: ['Your account has been deactivated.'] } }
  }

  if (user.signup_status === 'pending') {
    redirect('/pending-approval')
  }

  if (user.signup_status === 'rejected') {
    await supabase.auth.signOut()
    return { errors: { form: ['Your registration was rejected. Contact admin.'] } }
  }

  // Route to dashboard
  const roleDashboards: Record<string, string> = {
    student: '/requester',
    staff: '/requester',
    clerk: '/clerk',
    technician: '/technician',
    supervisor: '/supervisor',
    admin: '/admin',
  }
  redirect(roleDashboards[user.role] ?? '/requester')
  // TypeScript satisfaction
  return { success: true }
}

export async function logoutUser() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}