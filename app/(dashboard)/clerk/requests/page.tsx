//app
import { getFilteredRequests } from '@/lib/queries/request.queries';
import { RequestsTable } from '@/components/requests/requests-table';

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function ClerkAllRequestsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  const { data, totalPages } = await getFilteredRequests({
    role: 'clerk',
    status: sp.status,
    priority: sp.priority,
    search: sp.search,
    page,
  });

  // After fetching data, add:
    console.log('Raw data sample:', data?.[0]);

  // Transform: Supabase returns arrays for relations; extract first element
  const transformedRequests = (data ?? []).map((item: any) => ({
    id: item.id,
    ticket_number: item.ticket_number,
    title: item.title,
    created_at: item.created_at,
    updated_at: item.updated_at,
    status: item.status ?? null,      // already an object or null
    priority: item.priority ?? null,  // already an object or null
    category: item.category ?? null,  // already an object or null
    requester: item.requester ?? null,// already an object or null
  }));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Requests</h1>
        <span className="text-sm text-gray-500">Clerk – Read All</span>
      </div>
      <RequestsTable
        requests={transformedRequests}
        totalPages={totalPages}
        currentPage={page}
        detailBasePath="/clerk/requests"
      />
    </div>
  );
}