// components/requests/request-card.tsx
import Link from 'next/link'
import { StatusBadge } from '@/components/common/status-badge'
import { PriorityBadge } from '@/components/common/status-badge'
import { RequestTypeBadge } from '@/components/common/status-badge'
import { Calendar, MapPin, Hash } from 'lucide-react'

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
  href: string
}

export function RequestCard({ request, href }: RequestCardProps) {
  const formattedDate = new Date(request.created_at).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link href={href} className="block">
      <div
        className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 hover:bg-white dark:hover:bg-slate-900"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {request.ticket_number || 'N/A'}
              </span>
              <RequestTypeBadge type={request.request_type} />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {request.title}
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
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
          <div className="shrink-0">
            <StatusBadge status={request.status.status_name} />
          </div>
        </div>
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-blue-500/5 to-indigo-500/5" />
      </div>
    </Link>
  )
}