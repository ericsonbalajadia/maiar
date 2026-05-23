import Link from 'next/link'
import { StatusBadge } from '@/components/common/status-badge'
import { RequestTypeBadge } from '@/components/common/status-badge'
import { Calendar, MapPin } from 'lucide-react'

interface RequestCardProps {
  request: {
    id: string
    ticket_number: string | null
    title: string
    request_type: string
    created_at: string
    status: { status_name: string }
    priority: { level: string }
    location: { building_name: string }
  }
  fullHref?: string;
  variant?: 'default' | 'requester';
  hideStatus?: boolean; // new – hides the status badge when true
}

export function RequestCard({ request, fullHref, hideStatus = false, variant = 'default' }: RequestCardProps) {
  const formattedDate = new Date(request.created_at).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const linkHref = fullHref ? fullHref : `/clerk/requests/${request.id}/review`;
  const isRequester = variant === 'requester'

  return (
    <Link href={linkHref} className="block">
      <div
        className={
          isRequester
            ? "group relative rounded-[20px] border border-[#ADEBB3]/70 dark:border-white/10 bg-white/75 dark:bg-white/[0.05] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ADEBB3]/70 hover:bg-[#ADEBB3]/35 dark:hover:bg-white/[0.08]"
            : "group relative rounded-2xl border border-[#ADEBB3]/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#ADEBB3]/70 dark:hover:border-[#ADEBB3]/80 hover:bg-[#ADEBB3]/35 dark:hover:bg-white/[0.08]"
        }
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={isRequester ? "font-mono text-xs font-semibold text-[#527255] dark:text-emerald-300 bg-[#ADEBB3]/30 dark:bg-white/[0.06] px-2 py-0.5 rounded-md" : "font-mono text-xs font-semibold text-slate-500 dark:text-white/60 bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded-md"}>
                {request.ticket_number || 'N/A'}
              </span>
              <RequestTypeBadge type={request.request_type} />
            </div>
            <h3 className={isRequester ? "text-base font-semibold text-[#0b130b] dark:text-white line-clamp-1 group-hover:text-[#1e2c1f] dark:group-hover:text-emerald-300 transition-colors" : "text-base font-semibold text-slate-800 dark:text-white line-clamp-1 group-hover:text-[#527255] dark:group-hover:text-emerald-300 transition-colors"}>
              {request.title}
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-white/60">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {request.location.building_name}
              </span>
            </div>
          </div>
          {!hideStatus && (
            <div className="shrink-0">
              <StatusBadge status={request.status.status_name} />
            </div>
          )}
        </div>
        <div className={isRequester ? "absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[#ADEBB3]/15" : "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-blue-500/5 to-indigo-500/5"} />
      </div>
    </Link>
  )
}
