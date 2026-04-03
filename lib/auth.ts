// lib/auth.ts
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRoleDashboard } from '@/lib/rbac'
import type { UserRole } from '@/lib/rbac'

export async function getAuthUser(requiredRoles?: readonly UserRole[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single()

    if (!profile || profile.signup_status !== 'approved') {
        redirect('/pending-approval')
    }

    if (requiredRoles && !requiredRoles.includes(profile.role as UserRole)) {
        redirect(getRoleDashboard(profile.role))
    }

    return { user, profile }
}