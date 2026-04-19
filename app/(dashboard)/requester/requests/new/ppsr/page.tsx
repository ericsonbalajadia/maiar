// app/(dashboard)/requester/requests/new/ppsr/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getRoleDashboard, isRequesterRole } from '@/lib/rbac'
import { PpsrForm } from './ppsr-form'
import { ChevronLeft, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function PpsrRequestPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dbUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  if (!dbUser || dbUser.signup_status !== 'approved') redirect('/pending-approval')
  if (!isRequesterRole(dbUser.role)) redirect(getRoleDashboard(dbUser.role))

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('building_name')

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-500 -ml-2 h-8">
          <Link href="/requester/requests/new">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Glassmorphic header */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-violet-500/30">
          <ClipboardList className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Physical Plant Service Request
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fill all steps to submit · FM-GSO-15
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/requester/requests/new/rmr">
            <span className="text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 px-2.5 py-1 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-500 transition-colors cursor-pointer">
              R&amp;M
            </span>
          </Link>
          <span className="text-xs font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white px-2.5 py-1 rounded-lg shadow-sm">
            PPSR
          </span>
        </div>
      </div>

      <PpsrForm dbUser={dbUser} />
    </div>
  )
}