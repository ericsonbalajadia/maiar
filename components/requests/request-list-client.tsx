'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTransition, useCallback } from 'react'
import { RequestCard } from '@/components/requests/request-card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Loader2, SlidersHorizontal, X, FileX } from 'lucide-react'
import type { PaginatedRequests, RequestFilters } from '@/actions/request/request.actions'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  initialData: PaginatedRequests
  initialFilters: RequestFilters & { page: number }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'pending',      label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved',     label: 'Approved' },
  { value: 'assigned',     label: 'Assigned' },
  { value: 'in_progress',  label: 'In Progress' },
  { value: 'completed',    label: 'Completed' },
  { value: 'cancelled',    label: 'Cancelled' },
]

const TYPE_OPTIONS = [
  { value: 'rmr',  label: 'Repair & Maintenance (RMR)' },
  { value: 'ppsr', label: 'Physical Plant Service (PPSR)' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSearchParams(filters: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams()
  for (const [key, val] of Object.entries(filters)) {
    if (val !== undefined && val !== '' && val !== null) {
      params.set(key, String(val))
    }
  }
  return params.toString()
}

function activeFilterCount(filters: RequestFilters): number {
  return [filters.status, filters.request_type, filters.date_from, filters.date_to].filter(Boolean).length
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RequestListClient({ initialData, initialFilters }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const { data: requests, count, page, pageSize, totalPages } = initialData
  const filters = initialFilters

  const navigate = useCallback(
    (newFilters: Record<string, string | number | undefined>) => {
      const qs = buildSearchParams(newFilters)
      startTransition(() => {
        router.push(`${pathname}${qs ? `?${qs}` : ''}`)
      })
    },
    [router, pathname],
  )

  const handleFilterChange = (key: string, value: string) => {
    navigate({ ...filters, [key]: value || undefined, page: 1 })
  }

  const handleClearFilters = () => {
    navigate({ page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    navigate({ ...filters, page: newPage })
  }

  const filtersActive = activeFilterCount(filters)

  return (
    <div className="space-y-5 fade-in">
      {/* ── Glassmorphic Filter Bar ── */}
      <div
        className="rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-sm p-4"
        style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <SlidersHorizontal className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Filters</span>
          {filtersActive > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {filtersActive}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status */}
          <div className="space-y-1">
            <Label className="text-xs text-slate-500 dark:text-slate-400">Status</Label>
            <Select
              value={filters.status ?? 'all'}
              onValueChange={(v) => handleFilterChange('status', v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-9 text-sm bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-1">
            <Label className="text-xs text-slate-500 dark:text-slate-400">Request Type</Label>
            <Select
              value={filters.request_type ?? 'all'}
              onValueChange={(v) => handleFilterChange('request_type', v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-9 text-sm bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date from */}
          <div className="space-y-1">
            <Label className="text-xs text-slate-500 dark:text-slate-400">From</Label>
            <Input
              type="date"
              className="h-9 text-sm bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl"
              value={filters.date_from ?? ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />
          </div>

          {/* Date to */}
          <div className="space-y-1">
            <Label className="text-xs text-slate-500 dark:text-slate-400">To</Label>
            <Input
              type="date"
              className="h-9 text-sm bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl"
              value={filters.date_to ?? ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Results header ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isPending ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading…
            </span>
          ) : (
            <>
              {count === 0
                ? 'No requests found'
                : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, count)} of ${count} request${count !== 1 ? 's' : ''}`}
            </>
          )}
        </p>
      </div>

      {/* ── Scrollable Request Cards Container ── */}
<div
  className={`transition-opacity duration-150 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
>
  {requests.length === 0 ? (
    <EmptyState hasFilters={filtersActive > 0} onClear={handleClearFilters} />
  ) : (
    <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4 pb-2 pt-2 mt-4 custom-scrollbar">
      {requests.map((req, idx) => (
        <div
          key={req.id}
          className="fade-in"
          style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'forwards', opacity: 0 }}
        >
          <RequestCard
            request={{
              id: req.id,
              ticket_number: req.ticket_number,
              title: req.title,
              request_type: req.request_type,
              created_at: req.created_at,
              status: { status_name: req.statuses?.status_name ?? 'pending' },
              priority: { level: req.priorities?.level ?? 'normal' },
              location: { building_name: req.locations?.building_name ?? '—' },
            }}
            href={`/requester/requests/${req.id}`}
          />
        </div>
      ))}
    </div>
  )}
</div>

      {/* ── Pagination (styled) ── */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          isPending={isPending}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}

// ─── Empty state (without redundant clear button) ─────────────────────────────

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-inner">
        <FileX className="h-6 w-6 text-slate-400 dark:text-slate-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {hasFilters ? 'No requests match your filters' : 'No requests yet'}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {hasFilters
            ? 'Try adjusting your filters to see more results.'
            : 'Submit your first request to get started.'}
        </p>
      </div>
      {/* Clear button removed – use the global "Clear all" link in the page header */}
    </div>
  )
}

// ─── Pagination with gradient active page ─────────────────────────────────────

function Pagination({
  page,
  totalPages,
  isPending,
  onPageChange,
}: {
  page: number
  totalPages: number
  isPending: boolean
  onPageChange: (p: number) => void
}) {
  const pages: (number | 'ellipsis')[] = []
  const add = (n: number) => {
    if (!pages.includes(n)) pages.push(n)
  }

  add(1)
  if (page > 3) pages.push('ellipsis')
  if (page > 2) add(page - 1)
  add(page)
  if (page < totalPages - 1) add(page + 1)
  if (page < totalPages - 2) pages.push('ellipsis')
  add(totalPages)

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700"
        disabled={page <= 1 || isPending}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            disabled={isPending}
            className={`h-8 w-8 rounded-xl text-xs font-medium transition-all duration-200 ${
              p === page
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700"
        disabled={page >= totalPages || isPending}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}