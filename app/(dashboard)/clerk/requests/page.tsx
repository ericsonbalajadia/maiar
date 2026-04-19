// app/(dashboard)/clerk/requests/page.tsx
import { getFilteredRequests } from "@/lib/queries/request.queries";
import { RequestsTable } from "@/components/requests/requests-table";
import { ListFilter, ClipboardList } from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function ClerkAllRequestsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const month = sp.month;
  const year = sp.year;

  // Convert month/year to date range
  let startDate: string | undefined;
  let endDate: string | undefined;
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0);
    startDate = start.toISOString().split("T")[0];
    endDate = end.toISOString().split("T")[0];
  } else if (year) {
    startDate = `${year}-01-01`;
    endDate = `${year}-12-31`;
  } else if (month) {
    const currentYear = new Date().getFullYear();
    const start = new Date(currentYear, Number(month) - 1, 1);
    const end = new Date(currentYear, Number(month), 0);
    startDate = start.toISOString().split("T")[0];
    endDate = end.toISOString().split("T")[0];
  }

  const { data, error, totalPages } = await getFilteredRequests({
    role: "clerk",
    status: sp.status,
    priority: sp.priority,
    search: sp.search,
    startDate,
    endDate,
    page,
  });

  const transformedRequests = (data ?? []).map((item: any) => ({
    id: item.id,
    ticket_number: item.ticket_number,
    title: item.title,
    created_at: item.created_at,
    updated_at: item.updated_at,
    request_type: item.request_type,
    status: item.status ?? null,
    priority: item.priority ?? null,
    category: item.category ?? null,
    requester: item.requester ?? null,
  }));

return (
  <div className="h-[calc(100vh-80px)] max-w-7xl mx-auto flex flex-col gap-6 fade-in">
    
    {/* ── HEADER (fixed height) ── */}
    <div className="flex items-start justify-between gap-4 shrink-0">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-1">
          Clerk
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          All Requests
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Browse, filter, and manage all submitted service requests.
        </p>
      </div>

      <Link
        href="/clerk"
        className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm shrink-0"
      >
        <ClipboardList className="h-4 w-4" />
        Review Queue
      </Link>
    </div>

    {/* ── MAIN CARD (takes remaining height) ── */}
    <div
      className="flex-1 min-h-0 rounded-2xl border border-white/60 dark:border-slate-700/60 overflow-hidden shadow-sm flex flex-col"
      style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)" }}
    >
      
      {/* CARD HEADER */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100/80 dark:border-slate-800/60 bg-white/30 dark:bg-slate-900/30 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
          <ClipboardList className="h-3.5 w-3.5 text-white" />
        </div>

        <h2 className="text-sm font-bold text-slate-800 dark:text-white">
          All Requests
        </h2>

        {transformedRequests.length > 0 && (
          <span className="ml-auto text-xs font-medium text-slate-400 dark:text-slate-500">
            Page {page} · {transformedRequests.length} results
          </span>
        )}
      </div>

      {/* TABLE AREA (THIS CONTROLS SCROLL) */}
      <div className="flex-1 min-h-0 p-4 overflow-hidden">
        <RequestsTable
          requests={transformedRequests}
          totalPages={totalPages}
          currentPage={page}
          detailBasePath="/clerk/requests"
        />
      </div>
    </div>
  </div>
);
}