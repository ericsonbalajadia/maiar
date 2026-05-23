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
        <div className="w-11 h-11 bg-[#8dc192] rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-[#ADEBB3]/35">
          <ClipboardList className="h-5 w-5 text-[#1e2c1f]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Physical Plant Service Request
          </h1>
          <p className="text-sm text-slate-500 dark:text-white/60">
            Fill all steps to submit · FM-GSO-15
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/requester/requests/new/rmr">
            <span className="text-xs font-semibold border border-[#ADEBB3]/70 dark:border-white/10 text-slate-400 dark:text-white/45 px-2.5 py-1 rounded-lg hover:border-[#ADEBB3]/70 dark:hover:border-[#ADEBB3]/80 hover:text-[#527255] dark:hover:text-emerald-300 transition-colors cursor-pointer">
              R&amp;M
            </span>
          </Link>
          <span className="text-xs font-bold bg-[#8dc192] text-[#0b130b] px-2.5 py-1 rounded-lg shadow-sm">
            PPSR
          </span>
        </div>
      </div>

      <PpsrForm dbUser={dbUser} />
    </div>
  )
}
