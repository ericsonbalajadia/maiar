//app/(dashboard)/admin/notifications/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isRequesterRole } from '@/lib/rbac'
import { NotificationsPageContent } from '@/components/notifications/notification-page-content'

export default async function AdminNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dbUser } = await supabase
    .from('users').select('role, signup_status').eq('auth_id', user.id).single()

  if (!dbUser || dbUser.signup_status !== 'approved') redirect('/pending-approval')
  if (dbUser.role !== 'admin') redirect('/')

  return <NotificationsPageContent />
}