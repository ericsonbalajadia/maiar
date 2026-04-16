//app
import { getFilteredRequests } from "@/lib/queries/request.queries";
import { RequestsTable } from "@/components/requests/requests-table";
import { error } from "console";
import { request } from "http";

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

const { data, error, totalPages } = await getFilteredRequests({
  role: 'clerk',
  status: sp.status,
  priority: sp.priority,
  search: sp.search,
  startDate,
  endDate,
  page,
});

if (error) {
  console.error('Query error details:', error);
}

  // After fetching data, add:
  console.log("Raw data sample:", data?.[0]);

  if (error) {
  console.error('Query error:', error);
}
  console.log('Data count:', data?.length);

  // Transform: Supabase returns arrays for relations; extract first element
  const transformedRequests = (data ?? []).map((item: any) => ({
    id: item.id,
    ticket_number: item.ticket_number,
    title: item.title,
    created_at: item.created_at,
    updated_at: item.updated_at,
    request_type: item.request_type,
    status: item.status ?? null, // already an object or null
    priority: item.priority ?? null, // already an object or null
    category: item.category ?? null, // already an object or null
    requester: item.requester ?? null, // already an object or null
  }));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Requests</h1>
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
