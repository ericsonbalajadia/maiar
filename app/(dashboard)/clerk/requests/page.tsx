// app/(dashboard)/clerk/requests/page.tsx
import { getFilteredRequests } from "@/lib/queries/request.queries";
import { RequestsTable } from "@/components/requests/requests-table";
import { ClipboardList } from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function ClerkAllRequestsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const month = sp.month;
  const year = sp.year;

  // Convert month/year to date range (same as before)
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
    ppsr_details: item.ppsr_details ?? null,
  }));

  return (
    <div className="clerk-shell h-full flex flex-col gap-6 max-w-7xl mx-auto fade-in px-4 md:px-6">
      {/* Header (fixed) */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 shrink-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#58855C] dark:text-emerald-300 mb-1">
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
          className="clerk-button inline-flex items-center gap-2 self-start rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors shrink-0"
        >
          <ClipboardList className="h-4 w-4" />
          Review Queue
        </Link>
      </div>

      {/* Main card (flex‑1, takes remaining height) */}
      <div
        className="clerk-surface flex-1 min-h-0 rounded-2xl shadow-sm flex flex-col backdrop-blur-sm"
      >
        {/* Card header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#58855C]/20 dark:border-white/10 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#58855C] flex items-center justify-center shadow-sm">
            <ClipboardList className="h-3.5 w-3.5 text-white" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">All Requests</h2>
          {transformedRequests.length > 0 && (
            <span className="ml-auto text-xs font-medium text-slate-400 dark:text-slate-500">
              Page {page} · {transformedRequests.length} results
            </span>
          )}
        </div>

        {/* Table area (scrolls) */}
        <div className="flex-1 min-h-0 p-4 overflow-auto">
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
