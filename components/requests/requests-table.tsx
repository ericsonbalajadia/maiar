'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { StatusBadge } from '@/components/common/status-badge';
import { Search, X } from 'lucide-react';

interface RequestRow {
  id: string;
  ticket_number: string;
  title: string;
  created_at: string;
  status: { status_name: string } | null;
  priority: { level: string } | null;
  category: { category_name: string } | null;
  requester: { full_name: string } | null;
}

interface Props {
  requests: RequestRow[];
  totalPages: number;
  currentPage: number;
  detailBasePath: string;
}

export function RequestsTable({ requests, totalPages, currentPage, detailBasePath }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    router.push(`${pathname}?${next.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = params.get('status') || params.get('priority') || params.get('search');

  return (
    <div className="space-y-6">
      {/* Filter bar - improved */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                defaultValue={params.get('search') ?? ''}
                onBlur={(e) => setParam('search', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setParam('search', e.currentTarget.value)}
                placeholder="Ticket # or title..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              defaultValue={params.get('status') ?? ''}
              onChange={(e) => setParam('status', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {['pending', 'under_review', 'approved', 'assigned', 'in_progress', 'completed', 'cancelled'].map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
            <select
              defaultValue={params.get('priority') ?? ''}
              onChange={(e) => setParam('priority', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {['emergency', 'high', 'normal', 'low'].map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-10 px-3 text-sm text-gray-600 hover:text-gray-900 border rounded-lg flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table - responsive with horizontal scroll on mobile */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Ticket</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Requester</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Priority</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Created</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.ticket_number}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{r.title}</td>
                  <td className="px-4 py-3">{r.requester?.full_name ?? '—'}</td>
                  <td className="px-4 py-3">{r.category?.category_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.priority?.level === 'emergency'
                          ? 'bg-red-100 text-red-800'
                          : r.priority?.level === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : r.priority?.level === 'normal'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {r.priority?.level ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status?.status_name ?? ''} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString('en-PH')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => router.push(`${detailBasePath}/${r.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No requests found. Try adjusting your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={() => setParam('page', String(currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
                if (i === 6) pageNum = totalPages;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }
              if (pageNum < 1 || pageNum > totalPages) return null;
              if (i === 3 && totalPages > 7 && currentPage > 4 && currentPage < totalPages - 3) {
                return <span key="ellipsis" className="px-2 py-1">...</span>;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setParam('page', String(pageNum))}
                  className={`px-3 py-1 text-sm border rounded-lg ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setParam('page', String(currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}