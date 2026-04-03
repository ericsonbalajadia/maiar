// actions/auth.actions.ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { registerSchema, loginSchema } from '@/lib/validations/user.schema'
import { getRoleDashboard } from '@/lib/rbac'

export type LoginState = {
  errors?: {
    email?: string[]
    password?: string[]
    form?: string[] 
  }
  success?: boolean
}

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

export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  void prevState
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    full_name: formData.get('full_name') as string,
    role: formData.get('role') as string,
    department: formData.get('department') as string | undefined,
  }

  const result = registerSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  // const { error } = await supabase.auth.signUp({
  //   email: result.data.email,
  //   password: result.data.password,
  //   options: {
  //     data: {
  //       full_name: result.data.full_name,
  //       role: result.data.role,
  //       department: result.data.department ?? null,
  //     },
  //   },
  // })
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        full_name: result.data.full_name,
        role: result.data.role,
        department: result.data.department ?? null,
      },
      emailRedirectTo: `${appUrl}/api/auth/callback`,
    },
  })

  if (error) {
    return { errors: { form: [error.message] } }
  }

  redirect('/pending-approval')
}

export async function loginUser(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  void prevState
  console.log('=== loginUser started ===')
  console.log('Email from form:', formData.get('email'))

  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const result = loginSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  console.log('Supabase client created')

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  console.log('signInWithPassword result:', { authData, authError })

  if (authError || !authData.user) {
    return { errors: { form: ['Invalid email or password'] } }
  }

  console.log('Fetching user record from public.users for auth_id:', authData.user.id)

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role, signup_status, is_active')
    .eq('auth_id', authData.user.id)
    .single()

  console.log('User fetch result:', { user, userError })

  if (userError || !user) {
    console.log('User fetch failed, signing out')
    await supabase.auth.signOut()
    return { errors: { form: ['Account setup incomplete. Contact admin.'] } }
  }

  if (!user.is_active) {
    await supabase.auth.signOut()
    return { errors: { form: ['Your account has been deactivated.'] } }
  }

  if (user.signup_status === 'pending') {
    console.log('User is pending, redirecting to /pending-approval')
    redirect('/pending-approval')
  }

  if (user.signup_status === 'rejected') {
    await supabase.auth.signOut()
    return { errors: { form: ['Your registration was rejected. Contact admin.'] } }
  }

  console.log('User is approved, redirecting to role dashboard. Role:', user.role)
  redirect(getRoleDashboard(user.role))
}

export async function logoutUser() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}