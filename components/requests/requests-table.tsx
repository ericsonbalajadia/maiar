"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { StatusBadge } from "@/components/common/status-badge";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RequestRow {
  id: string;
  ticket_number: string;
  title: string;
  created_at: string;
  updated_at: string;
  request_type: string;
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

export function RequestsTable({
  requests,
  totalPages,
  currentPage,
  detailBasePath,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    router.push(`${pathname}?${next.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters =
    params.get("status") ||
    params.get("priority") ||
    params.get("search") ||
    params.get("month") ||
    params.get("year");

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Filter bar – unchanged (blue/slate) */}
      <div className="rounded-2xl border border-white/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm p-4 shrink-0">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                defaultValue={params.get("search") ?? ""}
                onBlur={(e) => setParam("search", e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && setParam("search", e.currentTarget.value)
                }
                placeholder="Ticket # or title..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Status dropdown */}
          <div className="w-40">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
              Status
            </label>
            <select
            aria-label="Filter by status"
              defaultValue={params.get("status") ?? ""}
              onChange={(e) => setParam("status", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.25rem",
              }}
            >
              <option value="">All</option>
              {[
                "pending",
                // "under_review",
                "approved",
                "assigned",
                "in_progress",
                "completed",
                "cancelled",
              ].map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Priority dropdown */}
          <div className="w-40">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
              Priority
            </label>
            <select
              aria-label="Filter by priority"
              defaultValue={params.get("priority") ?? ""}
              onChange={(e) => setParam("priority", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.25rem",
              }}
            >
              <option value="">All</option>
              {["emergency", "high", "normal", "low"].map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Month dropdown */}
          <div className="w-32">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
              Month
            </label>
            <select
              aria-label="Filter by month"
              defaultValue={params.get("month") ?? ""}
              onChange={(e) => setParam("month", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.25rem",
              }}
            >
              <option value="">All</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Year dropdown */}
          <div className="w-32">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
              Year
            </label>
            <select
              aria-label="Filter by year"
              defaultValue={params.get("year") ?? ""}
              onChange={(e) => setParam("year", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.25rem",
              }}
            >
              <option value="">All</option>
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-10 px-4 text-sm text-slate-700 dark:text-slate-200 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table container with vertical scroll and sticky header – unchanged */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar rounded-2xl">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
            <tr className="border-b border-slate-100 dark:border-slate-800/60">
              <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 first:pl-1 last:pr-1 whitespace-nowrap uppercase tracking-wide">
                Ticket
              </th>
              <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 whitespace-nowrap uppercase tracking-wide">
                Title
              </th>
              <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 whitespace-nowrap uppercase tracking-wide">
                Requester
              </th>
              <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 whitespace-nowrap uppercase tracking-wide">
                Priority
              </th>
              <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 whitespace-nowrap uppercase tracking-wide">
                Status
              </th>
              <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 whitespace-nowrap uppercase tracking-wide">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
            {requests.map((r) => (
              <tr
                key={r.id}
                onClick={() => {
                  const targetPath = detailBasePath.startsWith('/clerk')
                    ? `${detailBasePath}/${r.id}/review`
                    : `${detailBasePath}/${r.id}`;
                  router.push(targetPath);
                }}
                className="cursor-pointer transition-colors duration-150 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 group"
              >
                <td className="px-3 py-3.5 first:pl-1 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {r.ticket_number}
                </td>
                <td className="px-3 py-3.5 max-w-[180px]">
                  <span className="line-clamp-1 text-slate-700 dark:text-slate-300 font-medium text-sm">
                    {r.title}
                  </span>
                  <span className="text-xs text-slate-400 truncate block">
                    {r.category?.category_name ?? "No category"}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-sm text-slate-700 dark:text-slate-300 truncate">
                  {r.requester?.full_name ?? "—"}
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      r.priority?.level === "emergency"
                        ? "bg-red-100 text-red-600"
                        : r.priority?.level === "high"
                        ? "bg-orange-100 text-orange-600"
                        : r.priority?.level === "normal"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {r.priority?.level ?? "—"}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <StatusBadge status={r.status?.status_name ?? "pending"} />
                </td>
                <td className="px-3 py-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-16 text-center text-slate-400">
                  No requests found. Adjust filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination – ONLY THIS SECTION IS MODIFIED TO GREEN/GLASS */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 shrink-0 pt-2">
          <button
            onClick={() => setParam("page", String(currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm rounded-lg border border-[#ADEBB3]/70 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-sm hover:bg-[#ADEBB3]/35 dark:hover:bg-white/[0.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              if (
                i === 3 &&
                totalPages > 7 &&
                currentPage > 4 &&
                currentPage < totalPages - 3
              ) {
                return (
                  <span key="ellipsis" className="px-2 py-1 text-slate-400">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setParam("page", String(pageNum))}
                  className={`px-3 py-1 text-sm rounded-lg border ${
                    pageNum === currentPage
                      ? "bg-[#527255] text-white border-[#527255] shadow-sm"
                      : "border-[#ADEBB3]/70 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-sm hover:bg-[#ADEBB3]/35 dark:hover:bg-white/[0.08]"
                  } transition-all`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setParam("page", String(currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm rounded-lg border border-[#ADEBB3]/70 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-sm hover:bg-[#ADEBB3]/35 dark:hover:bg-white/[0.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}