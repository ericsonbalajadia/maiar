// app/(dashboard)/requester/requests/new/ppsr/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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
  if (!['student', 'staff'].includes(dbUser.role)) redirect(`/${dbUser.role}`)

  const [{ data: locations }, { data: priorities }] = await Promise.all([
    supabase.from('locations').select('id, building_name, floor_level, room_number').eq('is_active', true).order('building_name'),
    supabase.from('priorities').select('id, level').order('response_time_hours'),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-500 -ml-2 h-8">
          <Link href="/requester/requests/new">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
          <ClipboardList className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Physical Plant Service Request
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Fill all steps to submit</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-400 px-2.5 py-1 rounded-md">R&amp;M</span>
          <span className="text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2.5 py-1 rounded-md">PPSR</span>
        </div>
      </div>

      <PpsrForm
        locations={locations ?? []}
        priorities={priorities ?? []}
        dbUser={dbUser}
      />
    </div>
  )
}