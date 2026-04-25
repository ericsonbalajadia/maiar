import { getFilteredRequests } from '@/lib/queries/request.queries';
import { RequestsTable } from '@/components/requests/requests-table';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function AdminAllRequestsPage({ searchParams }: Props) {
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
    startDate = start.toISOString().split('T')[0];
    endDate = end.toISOString().split('T')[0];
  } else if (year) {
    startDate = `${year}-01-01`;
    endDate = `${year}-12-31`;
  } else if (month) {
    const currentYear = new Date().getFullYear();
    const start = new Date(currentYear, Number(month) - 1, 1);
    const end = new Date(currentYear, Number(month), 0);
    startDate = start.toISOString().split('T')[0];
    endDate = end.toISOString().split('T')[0];
  }

  const { data, totalPages } = await getFilteredRequests({
    role: 'admin',
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
    <div className="h-full flex flex-col max-w-7xl mx-auto px-6 py-4">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-slate-500 mb-4">
        <Link href="/admin" className="hover:text-slate-700 flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5 mx-1" />
        <span className="font-medium text-slate-700">All Requests</span>
      </div>
      <div className="shrink-0 mb-4">
        <h1 className="text-2xl font-bold">All Requests</h1>
      </div>
      <div className="flex-1 min-h-0">
        <RequestsTable
          requests={transformedRequests}
          totalPages={totalPages}
          currentPage={page}
          detailBasePath="/admin/requests"
        />
      </div>
    </div>
  );
}