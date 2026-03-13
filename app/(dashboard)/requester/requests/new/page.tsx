// app/(dashboard)/requester/requests/new/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Wrench, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function NewRequestPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dbUser } = await supabase
    .from('users')
    .select('role, signup_status')
    .eq('auth_id', user.id)
    .single()

  if (!dbUser || dbUser.signup_status !== 'approved') redirect('/pending-approval')
  if (!['student', 'staff'].includes(dbUser.role)) redirect(`/${dbUser.role}`)

  return (
    <div className="max-w-4xl mx-auto">

      {/* Page heading */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Submit New Request
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Choose the type of request you want to submit
        </p>
      </div>

      {/* Two type cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* R&M card */}
        <Link
          href="/requester/requests/new/rmr"
          className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
              <Wrench className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="pt-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Repair &amp; Maintenance
              </h2>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            For reporting broken equipment, electrical issues, plumbing, HVAC, and other facility repairs.
          </p>
          <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2.5 transition-all">
            Start this form
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>

        {/* PPSR card */}
        <Link
          href="/requester/requests/new/ppsr"
          className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
              <ClipboardList className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="pt-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Physical Plant Service
              </h2>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            For audio/sound setup, hauling, site development, tent installation, fabrication, and landscaping.
          </p>
          <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2.5 transition-all">
            Start this form
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>

      </div>

      {/* Back to dashboard */}
      <div className="flex justify-center mt-10">
        <Button asChild variant="ghost" size="sm" className="text-slate-500 gap-1.5">
          <Link href="/requester">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

    </div>
  )
}