//components/requests/requests-table.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { StatusBadge } from "@/components/common/status-badge";
import { Search, X, Calendar } from "lucide-react";

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
      {/* Filter bar (glassmorphic) */}
      <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg p-4 shrink-0">
        <div className="flex flex-wrap gap-3 items-end">
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

          <div className="w-40">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
              Status
            </label>
            <select
              defaultValue={params.get("status") ?? ""}
              onChange={(e) => setParam("status", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="">All</option>
              {[
                "pending",
                "under_review",
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

          <div className="w-40">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
              Priority
            </label>
            <select
              defaultValue={params.get("priority") ?? ""}
              onChange={(e) => setParam("priority", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="">All</option>
              {["emergency", "high", "normal", "low"].map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
              Month
            </label>
            <select
              defaultValue={params.get("month") ?? ""}
              onChange={(e) => setParam("month", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
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

          <div className="w-32">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
              Year
            </label>
            <select
              defaultValue={params.get("year") ?? ""}
              onChange={(e) => setParam("year", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="">All</option>
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i,
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

      {/* Table container (scrolls) */}
      <div className="flex-1 min-h-0 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="sticky top-0 z-10 backdrop-blur-md bg-white/30 dark:bg-gray-900/30 border-b px-4 py-3 grid grid-cols-12 text-xs font-semibold text-gray-600 dark:text-gray-300">
              <div className="col-span-2">Ticket</div>
              <div className="col-span-4">Request</div>
              <div className="col-span-2">Requester</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Date</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/10">
              {requests.map((r) => (
                <div
                  key={r.id}
                  onClick={() => router.push(`${detailBasePath}/${r.id}`)}
                  className="grid grid-cols-12 px-4 py-3 items-center cursor-pointer transition-all duration-200 hover:bg-white/20 hover:backdrop-blur-md group"
                >
                  <div className="col-span-2">
                    <p className="font-mono text-xs text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200">
                      {r.ticket_number}
                    </p>
                  </div>
                  <div className="col-span-4 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {r.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {r.category?.category_name ?? "No category"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {r.requester?.full_name ?? "—"}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        r.priority?.level === "emergency"
                          ? "bg-red-100 text-red-600"
                          : r.priority?.level === "high"
                          ? "bg-orange-100 text-orange-600"
                          : r.priority?.level === "normal"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.priority?.level ?? "—"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={r.status?.status_name ?? ""} />
                  </div>
                  <div className="col-span-1 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              ))}

              {requests.length === 0 && (
                <div className="py-16 text-center text-gray-400">
                  No requests found. Adjust filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination (sticky at bottom) */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 shrink-0 pt-2">
          <button
            onClick={() => setParam("page", String(currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm rounded-lg border border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-slate-800/60"
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
            className="px-3 py-1 text-sm rounded-lg border border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}