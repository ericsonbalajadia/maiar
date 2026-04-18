// app/(dashboard)/requester/requests/page.tsx
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getRoleDashboard, isRequesterRole } from '@/lib/rbac'
import { getRequesterRequests } from '@/actions/request/request.actions'
import { RequestListClient } from '@/components/requests/request-list-client'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, ListFilter } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    page?: string
    status?: string
    request_type?: string
    date_from?: string
    date_to?: string
  }>
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  )
}

// ─── Content (async, runs data fetching) ─────────────────────────────────────

async function RequestListContent({
  page,
  status,
  request_type,
  date_from,
  date_to,
}: {
  page: number
  status?: string
  request_type?: string
  date_from?: string
  date_to?: string
}) {
  const result = await getRequesterRequests({
    page,
    pageSize: 10,
    status: status || undefined,
    request_type: request_type || undefined,
    date_from: date_from || undefined,
    date_to: date_to || undefined,
  })

  return (
    <RequestListClient
      initialData={result}
      initialFilters={{ page, status, request_type, date_from, date_to }}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RequesterRequestsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dbUser } = await supabase
    .from('users')
    .select('role, signup_status')
    .eq('auth_id', user.id)
    .single()

  if (!dbUser || dbUser.signup_status !== 'approved') redirect('/pending-approval')
  if (!isRequesterRole(dbUser.role)) redirect(getRoleDashboard(dbUser.role))

  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-1">
            My Requests
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Requests</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track and manage all your submitted service requests.
          </p>
        </div>
        <Link
          href="/requester/requests/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 shrink-0"
        >
          <FileText className="h-4 w-4" />
          New Request
        </Link>
      </div>

      {/* Filter info badge */}
      {(sp.status || sp.request_type || sp.date_from || sp.date_to) && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl px-3 py-2">
          <ListFilter className="h-3.5 w-3.5 text-blue-400" />
          Filters applied —{' '}
          <Link href="/requester/requests" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Clear all
          </Link>
        </div>
      )}

      {/* Async content with suspense */}
      <Suspense fallback={<ListSkeleton />}>
        <RequestListContent
          page={page}
          status={sp.status}
          request_type={sp.request_type}
          date_from={sp.date_from}
          date_to={sp.date_to}
        />
      </Suspense>
    </div>
  )
}