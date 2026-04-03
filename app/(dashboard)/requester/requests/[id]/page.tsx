// app/(dashboard)/requester/requests/[id]/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRoleDashboard, isRequesterRole } from '@/lib/rbac'
import { getRequestById } from '@/actions/request/request.actions'
import { StatusBadge, RequestTypeBadge, PriorityBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { STATUS_NAMES } from '@/lib/constants/statuses'
import {
  ChevronLeft,
  Paperclip,
  MessageSquare,
  CheckCircle2,
  Wrench,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isWithin30Days(dateStr: string | null) {
  if (!dateStr) return false
  return Date.now() - new Date(dateStr).getTime() <= 30 * 24 * 60 * 60 * 1000
}

// ─── Status stepper ───────────────────────────────────────────────────────────
// New flow: pending → under_review → approved → assigned → in_progress → completed
// Cancelled is terminal but shown separately (not in the linear flow)

const STATUS_FLOW = [
  { key: STATUS_NAMES.PENDING,      label: 'Pending' },
  { key: STATUS_NAMES.UNDER_REVIEW, label: 'Under Review' },
  { key: STATUS_NAMES.APPROVED,     label: 'Approved' },
  { key: STATUS_NAMES.ASSIGNED,     label: 'Assigned' },
  { key: STATUS_NAMES.IN_PROGRESS,  label: 'In Progress' },
  { key: STATUS_NAMES.COMPLETED,    label: 'Completed' },
]

function StatusStepper({ currentStatus }: { currentStatus: string }) {
  const normalised = currentStatus.toLowerCase().replace(/\s+/g, '_')
  const isCancelled = normalised === STATUS_NAMES.CANCELLED
  const currentIndex = STATUS_FLOW.findIndex((s) => s.key === normalised)

  if (isCancelled) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Status Progress</h3>
        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <span className="text-sm font-medium text-red-700 dark:text-red-400">
            This request has been cancelled.
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-5">Status Progress</h3>
      <div className="flex items-start">
        {STATUS_FLOW.map((step, index) => {
          const isPast    = index < currentIndex
          const isCurrent = index === currentIndex
          const isFuture  = index > currentIndex

          return (
            <div key={step.key} className="flex items-start flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                  isPast
                    ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white'
                    : isCurrent
                    ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}>
                  {isPast
                    ? <CheckCircle2 className="h-4 w-4 text-white dark:text-slate-900" />
                    : isCurrent
                    ? <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-900" />
                    : <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                  }
                </div>
                <span className={`text-xs text-center leading-tight ${
                  isCurrent
                    ? 'font-semibold text-slate-900 dark:text-white'
                    : isPast
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < STATUS_FLOW.length - 1 && (
                <div className={`flex-1 h-px mt-4 mx-1 ${
                  index < currentIndex
                    ? 'bg-slate-900 dark:bg-white'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="text-sm text-slate-500 dark:text-slate-400 min-w-[120px] shrink-0">{label}:</span>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 break-words">{value}</span>
    </div>
  )
}

// ─── Feedback Prompt ──────────────────────────────────────────────────────────

function FeedbackPrompt({ requestId }: { requestId: string }) {
  return (
    <div id="feedback" className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
          <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">How did we do?</h3>
          <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
            Your request has been completed. Share your feedback — it helps us improve.
          </p>
          <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300">
            <MessageSquare className="h-3.5 w-3.5 mr-2" />
            Leave Feedback
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
      <Skeleton className="h-40 rounded-xl" />
    </div>
  )
}

// ─── Main content ─────────────────────────────────────────────────────────────

async function RequestDetailContent({ id }: { id: string }) {
  const request = await getRequestById(id)
  if (!request) notFound()

  const currentStatusName = request.statuses?.status_name ?? 'pending'
  const isCompleted = currentStatusName === STATUS_NAMES.COMPLETED
  const showFeedback = isCompleted && isWithin30Days(request.actual_completion_date)

  const rmr  = request.rmr_details
  const ppsr = request.ppsr_details
  const hasInspection = rmr && (rmr.inspection_date || rmr.inspector_notes)

  return (
    <div className="space-y-5">

      {/* Title row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{request.ticket_number}</h1>
            <StatusBadge status={currentStatusName} />
            {request.priorities?.level && <PriorityBadge level={request.priorities.level} />}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Request Details</p>
        </div>
        <RequestTypeBadge type={request.request_type} showFull />
      </div>

      {/* Feedback prompt */}
      {showFeedback && <FeedbackPrompt requestId={request.id} />}

      {/* Status stepper */}
      <StatusStepper currentStatus={currentStatusName} />

      {/* Two-column info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Request Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Request Information</h3>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            <InfoRow label="Ref #" value={<span className="font-mono">{request.ticket_number}</span>} />
            <InfoRow label="Date" value={formatDate(request.created_at)} />
            <InfoRow label="Building" value={request.locations?.building_name ?? '—'} />
            <InfoRow label="Location" value={
              [
                request.locations?.floor_level && `Floor ${request.locations.floor_level}`,
                request.locations?.room_number  && `Room ${request.locations.room_number}`,
              ].filter(Boolean).join(', ') || '—'
            } />
            <InfoRow label="Requester" value={request.users?.full_name ?? '—'} />
            <InfoRow label="Department" value={request.users?.department ?? '—'} />
            <InfoRow label="Email" value={
              <a href={`mailto:${request.users?.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                {request.users?.email ?? '—'}
              </a>
            } />
          </div>
        </div>

        {/* Work Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Work Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                {request.request_type === 'rmr' ? 'Nature of Work' : 'Service Type'}
              </p>
              {request.request_type === 'rmr' ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {request.categories?.category_name ?? '—'}
                  </span>
                </div>
              ) : ppsr ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                    {ppsr.service_type.replace(/_/g, ' ')}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-slate-400">—</span>
              )}
            </div>

            {/* PPSR service_data fields */}
            {ppsr?.service_data && typeof ppsr.service_data === 'object' && (
              <div className="mt-2 space-y-1">
                {Object.entries(ppsr.service_data as Record<string, unknown>)
                  .filter(([, v]) => v !== null && v !== undefined && v !== '')
                  .map(([key, val]) => (
                    <div key={key} className="flex gap-2 text-sm">
                      <span className="text-slate-400 min-w-[160px] shrink-0 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                      </span>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Description */}
            <div className="pt-3 border-t border-slate-50 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {request.description ?? 'No description provided.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Report (RMR only, if filled) */}
      {request.request_type === 'rmr' && rmr && hasInspection && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-slate-400" />
            Inspection Report
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1">
            {rmr.inspection_date     && <InfoRow label="Date"         value={formatDate(rmr.inspection_date)} />}
            {rmr.inspection_time_start && <InfoRow label="Time Start" value={rmr.inspection_time_start} />}
            {rmr.inspection_time_end   && <InfoRow label="Time End"   value={rmr.inspection_time_end} />}
            {rmr.repair_mode           && <InfoRow label="Repair Mode" value={rmr.repair_mode} />}
            {rmr.estimated_duration    && <InfoRow label="Est. Duration" value={rmr.estimated_duration} />}
            {rmr.materials_available !== null && (
              <InfoRow label="Materials" value={rmr.materials_available ? 'Available' : 'Not available'} />
            )}
            {rmr.manpower_required !== null && (
              <InfoRow label="Manpower" value={`${rmr.manpower_required} person(s)`} />
            )}
          </div>
          {rmr.inspector_notes && (
            <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Inspector Notes</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{rmr.inspector_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Attachments */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-slate-400" />
          Attachments
        </h3>
        {!request.attachments || request.attachments.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No attachments uploaded.</p>
        ) : (
          <div className="space-y-2">
            {request.attachments.map((file) => (
              <a
                key={file.id}
                href={file.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                  <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{file.file_name}</p>
                  <p className="text-xs text-slate-400">{formatFileSize(file.file_size)} · {file.mime_type}</p>
                </div>
                <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">Download</span>
              </a>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dbUser } = await supabase
    .from('users').select('role, signup_status').eq('auth_id', user.id).single()

  if (!dbUser || dbUser.signup_status !== 'approved') redirect('/pending-approval')
  if (!isRequesterRole(dbUser.role)) redirect(getRoleDashboard(dbUser.role))

  const { id } = await params

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 text-slate-500 hover:text-slate-700 -ml-2 h-8">
        <Link href="/requester/requests">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>
      <Suspense fallback={<DetailSkeleton />}>
        <RequestDetailContent id={id} />
      </Suspense>
    </div>
  )
}