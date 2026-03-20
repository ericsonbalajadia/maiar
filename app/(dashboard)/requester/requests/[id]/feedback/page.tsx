import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRequestsByRequester } from "@/lib/queries/request.queries";
import { RequestCard } from "@/components/requests/request-card";
import Link from "next/link";

export default async function RequesterRequestsPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user },} = await supabase.auth.getUser();
  if (!user) return null; // middleware already redirects

  const { data: profile } = await admin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  const { data: requests } = profile
    ? await getRequestsByRequester(profile.id)
    : { data: [] };

  return (
    <div className="space-y-6">
      {/* Page header — uses components/layout/page-header.tsx */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage your maintenance requests
          </p>
        </div>
        <Link
          href="/requester/new"
          className="inline-flex items-center gap-2 rounded-lg
                     bg-teal-600 px-4 py-2 text-sm font-semibold
                     text-white hover:bg-teal-700 transition-colors"
        >
          + New Request
        </Link>
      </div>

      {/* Request list */}
      {requests && requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              href={`/requester/requests/${r.id}`}
            />
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl border-2 border-dashed
                        border-slate-200 p-16 text-center"
        >
          <p className="text-slate-500 font-medium">No requests yet</p>
          <Link
            href="/requester/new"
            className="mt-3 inline-block text-sm font-medium
                       text-teal-600 hover:underline"
          >
            Submit your first request →
          </Link>
        </div>
      )}
    </div>
  );
}
