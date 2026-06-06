//components/requests/requests-table.tsx:

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
  ppsr_details?: { service_type: string } | null;
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
  // Debug logs (Ericson)
  if (requests.length > 0) {
    const ppsrRequests = requests.filter(r => r.request_type === 'ppsr');
    if (ppsrRequests.length > 0) {
      console.log('[DEBUG RequestsTable] PPSR requests found:', ppsrRequests.length);
      console.log('[DEBUG RequestsTable] First PPSR request:', ppsrRequests[0]);
      console.log('[DEBUG RequestsTable] ppsr_details field:', ppsrRequests[0].ppsr_details);
    }
  }

  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const isClerk = detailBasePath.startsWith("/clerk");
  const isSupervisor = detailBasePath.startsWith("/supervisor");

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
      {/* Filter bar – role‑based styling */}
      <div className={cn(
        "rounded-2xl border backdrop-blur-md shadow-lg p-4 shrink-0",
        isClerk ? "clerk-surface" : isSupervisor ? "supervisor-surface" : "border-[#ADEBB3]/70 bg-white/10"
      )}>
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
                className={cn(
                  "w-full pl-9 pr-3 py-2 rounded-xl border dark:border-white/10 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                  isClerk ? "border-[#58855C]/25 focus:ring-[#58855C]/25" :
                  isSupervisor ? "border-[#0D3311]/20 focus:ring-[#0D3311]/20" :
                  "border-[#ADEBB3]/70 focus:ring-[#8dc192]/50"
                )}
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
              className={cn(
                "w-full px-3 py-2 rounded-xl border dark:border-white/10 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm text-sm focus:outline-none focus:ring-2 appearance-none cursor-pointer",
                isClerk ? "border-[#58855C]/25 focus:ring-[#58855C]/25" :
                isSupervisor ? "border-[#0D3311]/20 focus:ring-[#0D3311]/20" :
                "border-[#ADEBB3]/70 focus:ring-[#8dc192]/50"
              )}
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

          {/* Priority dropdown */}
          <div className="w-40">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
              Priority
            </label>
            <select
              aria-label="Filter by priority"
              defaultValue={params.get("priority") ?? ""}
              onChange={(e) => setParam("priority", e.target.value)}
              className={cn(
                "w-full px-3 py-2 rounded-xl border dark:border-white/10 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm text-sm focus:outline-none focus:ring-2 appearance-none cursor-pointer",
                isClerk ? "border-[#58855C]/25 focus:ring-[#58855C]/25" :
                isSupervisor ? "border-[#0D3311]/20 focus:ring-[#0D3311]/20" :
                "border-[#ADEBB3]/70 focus:ring-[#8dc192]/50"
              )}
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
              className={cn(
                "w-full px-3 py-2 rounded-xl border dark:border-white/10 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm text-sm focus:outline-none focus:ring-2 appearance-none cursor-pointer",
                isClerk ? "border-[#58855C]/25 focus:ring-[#58855C]/25" :
                isSupervisor ? "border-[#0D3311]/20 focus:ring-[#0D3311]/20" :
                "border-[#ADEBB3]/70 focus:ring-[#8dc192]/50"
              )}
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
              className={cn(
                "w-full px-3 py-2 rounded-xl border dark:border-white/10 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm text-sm focus:outline-none focus:ring-2 appearance-none cursor-pointer",
                isClerk ? "border-[#58855C]/25 focus:ring-[#58855C]/25" :
                isSupervisor ? "border-[#0D3311]/20 focus:ring-[#0D3311]/20" :
                "border-[#ADEBB3]/70 focus:ring-[#8dc192]/50"
              )}
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
              className={cn(
                "h-10 px-4 text-sm text-slate-700 dark:text-white/90 bg-white/40 dark:bg-white/[0.04] backdrop-blur-sm rounded-xl border dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/[0.08] transition-all flex items-center gap-1",
                isClerk ? "border-[#58855C]/25 hover:bg-[#58855C]/10" :
                isSupervisor ? "border-[#0D3311]/20 hover:bg-[#0D3311]/10" :
                "border-[#ADEBB3]/70 hover:bg-[#ADEBB3]/35"
              )}
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table container – role‑based styling, scrollable, semantic table */}
      <div className={cn(
        "flex-1 min-h-0 rounded-2xl border backdrop-blur-md shadow-lg flex flex-col overflow-hidden",
        isClerk ? "clerk-surface" : isSupervisor ? "supervisor-surface" : "border-[#ADEBB3]/70 bg-white/10"
      )}>
        <div className="flex-1 overflow-auto">
          <div className="min-w-[800px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-white/[0.05]">
                <tr className={cn(
                  "border-b",
                  isClerk ? "border-[#58855C]/20" :
                  isSupervisor ? "border-[#0D3311]/20" :
                  "border-[#ADEBB3]/70"
                )}>
                  <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 first:pl-1 whitespace-nowrap uppercase tracking-wide">Ticket</th>
                  <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 whitespace-nowrap uppercase tracking-wide">Title</th>
                  <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 whitespace-nowrap uppercase tracking-wide">Requester</th>
                  <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 whitespace-nowrap uppercase tracking-wide">Priority</th>
                  <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 whitespace-nowrap uppercase tracking-wide">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 whitespace-nowrap uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className={cn(
                "divide-y",
                isClerk ? "divide-[#58855C]/20 dark:divide-white/10" :
                isSupervisor ? "divide-[#0D3311]/15 dark:divide-white/10" :
                "divide-[#ADEBB3]/45 dark:divide-[#ADEBB3]/30"
              )}>
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => {
                      const targetPath = detailBasePath.startsWith("/clerk")
                        ? `${detailBasePath}/${r.id}/review`
                        : `${detailBasePath}/${r.id}`;
                      router.push(targetPath);
                    }}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:backdrop-blur-md group",
                      isClerk ? "hover:bg-[#58855C]/10" :
                      isSupervisor ? "hover:bg-[#0D3311]/10" :
                      "hover:bg-[#ADEBB3]/35"
                    )}
                  >
                    <td className="px-3 py-3.5 first:pl-1 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {r.ticket_number}
                    </td>
                    <td className="px-3 py-3.5 max-w-[180px]">
                      <div className="line-clamp-1 text-slate-700 dark:text-slate-300 font-medium text-sm">
                        {r.title}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {r.request_type === "ppsr"
                          ? r.ppsr_details?.service_type?.replace(/_/g, " ") || "—"
                          : (r.category?.category_name ?? "No category")}
                      </div>
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
        </div>
      </div>

      {/* Pagination – role‑based styling */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 shrink-0 pt-2">
          <button
            onClick={() => setParam("page", String(currentPage - 1))}
            disabled={currentPage === 1}
            className={cn(
              "px-3 py-1 text-sm rounded-lg border dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-sm hover:bg-white/60 dark:hover:bg-white/[0.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              isClerk ? "border-[#58855C]/25 hover:bg-[#58855C]/10" :
              isSupervisor ? "border-[#0D3311]/20 hover:bg-[#0D3311]/10" :
              "border-[#ADEBB3]/70 hover:bg-[#ADEBB3]/35"
            )}
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
                  className={cn(
                    "px-3 py-1 text-sm rounded-lg border transition-all",
                    pageNum === currentPage
                      ? isClerk
                        ? "bg-[#58855C] text-white border-[#58855C]/25 shadow-sm"
                        : isSupervisor
                          ? "bg-[#0D3311] text-white border-[#0D3311]/20 shadow-sm"
                          : "bg-[#527255] text-white border-[#ADEBB3]/70 shadow-sm"
                      : isClerk
                        ? "border-[#58855C]/25 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-sm hover:bg-[#58855C]/10 dark:hover:bg-white/[0.08]"
                        : isSupervisor
                          ? "border-[#0D3311]/20 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-sm hover:bg-[#0D3311]/10 dark:hover:bg-white/[0.08]"
                          : "border-[#ADEBB3]/70 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-sm hover:bg-[#ADEBB3]/35 dark:hover:bg-white/[0.08]"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setParam("page", String(currentPage + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              "px-3 py-1 text-sm rounded-lg border dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-sm hover:bg-white/60 dark:hover:bg-white/[0.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              isClerk ? "border-[#58855C]/25 hover:bg-[#58855C]/10" :
              isSupervisor ? "border-[#0D3311]/20 hover:bg-[#0D3311]/10" :
              "border-[#ADEBB3]/70 hover:bg-[#ADEBB3]/35"
            )}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}