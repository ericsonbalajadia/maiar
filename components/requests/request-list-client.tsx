'use client'

// components/requests/request-list-client.tsx
// Handles filter UI, pagination controls, and empty states.
// Receives server-fetched initial data; uses router.push for filter changes
// so the server page re-fetches with new searchParams (no client-side refetch).

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

  // Navigate to new URL — server will re-fetch
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
    <div className="space-y-4">
      {/* ── Filter bar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filters</span>
          {filtersActive > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
              {filtersActive}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status */}
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Status</Label>
            <Select
              value={filters.status ?? 'all'}
              onValueChange={(v) => handleFilterChange('status', v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-8 text-xs">
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
            <Label className="text-xs text-slate-500">Request Type</Label>
            <Select
              value={filters.request_type ?? 'all'}
              onValueChange={(v) => handleFilterChange('request_type', v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-8 text-xs">
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
            <Label className="text-xs text-slate-500">From</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={filters.date_from ?? ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />
          </div>

          {/* Date to */}
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">To</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={filters.date_to ?? ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
          </div>
        </div>

        {filtersActive > 0 && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ── Results header ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
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

      {/* ── Request cards ── */}
      {requests.length === 0 ? (
        <EmptyState hasFilters={filtersActive > 0} onClear={handleClearFilters} />
      ) : (
        <div className={`space-y-3 transition-opacity duration-150 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {requests.map((req) => (
            <RequestCard
              key={req.id}
              request={{
                id: req.id,
                ticket_number: req.ticket_number,
                title: req.title,
                request_type: req.request_type,
                created_at: req.created_at,
                // RequestSummary shape — map from RequestWithRelations
                status: { status_name: req.statuses?.status_name ?? 'pending' },
                priority: { level: req.priorities?.level ?? 'normal' },
                location: { building_name: req.locations?.building_name ?? '—' },
              }}
              href={`/requester/requests/${req.id}`}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
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

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean
  onClear: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <FileX className="h-5 w-5 text-slate-400" />
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
      {hasFilters && (
        <button
          onClick={onClear}
          className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

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
  // Build a compact page window: always show first, last, current ±1
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
        className="h-8 w-8"
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
            className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${
              p === page
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
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
        className="h-8 w-8"
        disabled={page >= totalPages || isPending}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}