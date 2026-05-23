// app/(dashboard)/requester/requests/new/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRoleDashboard, isRequesterRole } from '@/lib/rbac'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Wrench, ClipboardList, Sparkles } from 'lucide-react'
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
  if (!isRequesterRole(dbUser.role)) redirect(getRoleDashboard(dbUser.role))

  return (
    <div className="max-w-3xl mx-auto fade-in">

      {/* Page heading */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#3f8f4a] dark:text-emerald-300 mb-2">
          New Request
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          What do you need help with?
        </h1>
        <p className="text-sm text-slate-500 dark:text-white/60 mt-1.5">
          Choose the type of request that best matches your need
        </p>
      </div>

      {/* Two type cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* R&M card */}
        <Link
          href="/requester/requests/new/rmr"
          className="group relative overflow-hidden rounded-2xl border border-[#ADEBB3]/70 dark:border-white/10 p-7 hover:border-[#ADEBB3]/70 dark:hover:border-[#ADEBB3]/80 hover:bg-[#ADEBB3]/35 dark:hover:bg-white/[0.08] hover:shadow-lg hover:shadow-[#ADEBB3]/25 transition-all duration-300 hover:-translate-y-1 fade-in-delay-1"
          style={{ background: 'var(--gradient-card)', backdropFilter: 'blur(12px)', opacity: 0 }}
        >
          {/* Gradient blob */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#ADEBB3] opacity-0 group-hover:opacity-25 blur-xl transition-opacity duration-300" />

          <div className="relative">
            <div className="w-12 h-12 bg-[#8dc192] rounded-2xl flex items-center justify-center mb-5 shadow-md shadow-[#ADEBB3]/35 group-hover:scale-105 transition-transform duration-200">
              <Wrench className="h-6 w-6 text-[#1e2c1f]" />
            </div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Repair &amp; Maintenance
              </h2>
              <span className="text-xs font-bold bg-[#ADEBB3]/55 dark:bg-white/[0.07] text-[#1e2c1f] dark:text-emerald-300 px-2 py-0.5 rounded-full">
                R&M
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-white/60 leading-relaxed mb-6">
              Broken equipment, electrical issues, plumbing, HVAC, and other facility repairs requiring a technician.
            </p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#527255] dark:text-emerald-300 group-hover:gap-3 transition-all duration-200">
              Start this form
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </Link>

        {/* PPSR card */}
        <Link
          href="/requester/requests/new/ppsr"
          className="group relative overflow-hidden rounded-2xl border border-[#ADEBB3]/70 dark:border-white/10 p-7 hover:border-[#ADEBB3]/70 dark:hover:border-[#ADEBB3]/80 hover:bg-[#ADEBB3]/35 dark:hover:bg-white/[0.08] hover:shadow-lg hover:shadow-[#ADEBB3]/25 transition-all duration-300 hover:-translate-y-1 fade-in-delay-2"
          style={{ background: 'var(--gradient-card)', backdropFilter: 'blur(12px)', opacity: 0 }}
        >
          {/* Gradient blob */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#ADEBB3] opacity-0 group-hover:opacity-25 blur-xl transition-opacity duration-300" />

          <div className="relative">
            <div className="w-12 h-12 bg-[#8dc192] rounded-2xl flex items-center justify-center mb-5 shadow-md shadow-[#ADEBB3]/35 group-hover:scale-105 transition-transform duration-200">
              <ClipboardList className="h-6 w-6 text-[#1e2c1f]" />
            </div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Physical Plant Service
              </h2>
              <span className="text-xs font-bold bg-[#ADEBB3]/55 dark:bg-white/[0.07] text-[#1e2c1f] dark:text-emerald-300 px-2 py-0.5 rounded-full">
                PPSR
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-white/60 leading-relaxed mb-6">
              Audio setup, hauling, site development, tent installation, fabrication, and landscaping services.
            </p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#527255] dark:text-emerald-300 group-hover:gap-3 transition-all duration-200">
              Start this form
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </Link>

      </div>

      {/* Info callout */}
      <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.05] border border-[#ADEBB3]/70 dark:border-white/10 px-4 py-3 fade-in-delay-3" style={{ opacity: 0 }}>
        <Sparkles className="h-4 w-4 text-[#3f8f4a] dark:text-emerald-300 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 dark:text-white/60 leading-relaxed">
          All submitted requests are reviewed by the General Services Office. You&apos;ll be notified at every step of the process.
        </p>
      </div>

      {/* Back to dashboard */}
      <div className="flex justify-center mt-8">
        <Button asChild variant="ghost" size="sm" className="text-slate-400 hover:text-[#527255] dark:hover:text-[#527255] gap-1.5">
          <Link href="/requester">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

    </div>
  )
}
