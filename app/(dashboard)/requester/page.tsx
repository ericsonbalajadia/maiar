// app/(dashboard)/requester/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRoleDashboard, isRequesterRole } from "@/lib/rbac";
import {
  getRequesterStats,
  getRecentRequests,
} from "@/actions/request/request.actions";
import {
  StatusBadge,
  RequestTypeBadge,
  PriorityBadge,
} from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardList,
  Clock,
  Wrench,
  CheckCircle2,
  Plus,
  Eye,
  Star,
  FileText,
  InboxIcon,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr)
    .toLocaleDateString("en-PH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
          {value}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {label}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

async function StatsRow() {
  const stats = await getRequesterStats();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Requests"
        value={stats.total}
        icon={ClipboardList}
        iconBg="bg-slate-100 dark:bg-slate-800"
        iconColor="text-slate-500 dark:text-slate-400"
      />
      <StatCard
        label="Pending"
        value={stats.pending}
        icon={FileText}
        iconBg="bg-amber-50 dark:bg-amber-900/20"
        iconColor="text-amber-500"
        sub="Awaiting action"
      />
      <StatCard
        label="In Progress"
        value={stats.inProgress}
        icon={Wrench}
        iconBg="bg-blue-50 dark:bg-blue-900/20"
        iconColor="text-blue-500"
        sub="Being worked on"
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        icon={CheckCircle2}
        iconBg="bg-emerald-50 dark:bg-emerald-900/20"
        iconColor="text-emerald-500"
      />
    </div>
  );
}

// ─── Request History Table ────────────────────────────────────────────────────

interface RecentRequest {
  id: string;
  ticket_number: string;
  request_type: string;
  title: string;
  created_at: string;
  statuses: { status_name: string } | null;
  categories: { category_name: string } | null;
  locations: { building_name: string } | null;
  hasFeedback: boolean;
}

async function RequestHistoryTable() {
  const rawRequests = await getRecentRequests();
  const requests = rawRequests.map((req: any) => ({
    ...req,
    hasFeedback: req.hasFeedback ?? false,
  })) as RecentRequest[];

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <InboxIcon className="h-7 w-7 text-slate-400" />
        </div>
        <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
          No requests yet
        </p>
        <p className="text-sm text-slate-400 mb-5">
          Submit your first request to get started.
        </p>
        <Button asChild size="sm">
          <Link href="/requester/requests/new">
            <Plus className="h-4 w-4 mr-2" />
            Submit New Request
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            {[
              "Ref #",
              "Type",
              "Date",
              "Nature of Work",
              "Building",
              "Status",
              "Action",
            ].map((h) => (
              <th
                key={h}
                className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-3 first:pl-0 last:pr-0 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
          {requests.map((req) => {
            const statusName = req.statuses?.status_name?.toLowerCase() ?? "";
            const isCompleted = statusName === "completed";
            const location = req.locations
              ? [req.locations.building_name].filter(Boolean).join(", ")
              : "—";

            return (
              <tr
                key={req.id}
                className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                {/* Ref # */}
                <td className="px-3 py-3.5 first:pl-0 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {req.ticket_number}
                </td>
                {/* Type */}
                <td className="px-3 py-3.5">
                  <RequestTypeBadge type={req.request_type} />
                </td>
                {/* Date */}
                <td className="px-3 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {formatDate(req.created_at)}
                </td>
                {/* Nature of Work */}
                <td className="px-3 py-3.5 max-w-[180px]">
                  <span className="line-clamp-1 text-slate-700 dark:text-slate-300 font-medium">
                    {req.categories?.category_name ?? req.title}
                  </span>
                </td>
                {/* Building */}
                <td className="px-3 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {location}
                </td>
                {/* Status */}
                <td className="px-3 py-3.5">
                  <StatusBadge
                    status={req.statuses?.status_name ?? "pending"}
                  />
                </td>
                {/* Actions */}
                <td className="px-3 py-3.5 last:pr-0">
                  <div className="flex items-center gap-1.5">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs gap-1.5"
                    >
                      <Link href={`/requester/requests/${req.id}`}>
                        <Eye className="h-3 w-3" />
                        View
                      </Link>
                    </Button>
                    {isCompleted && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className={`h-7 px-2.5 text-xs gap-1.5 ${
                          req.hasFeedback
                            ? "bg-yellow-50 border-yellow-300 text-yellow-600 hover:bg-yellow-100"
                            : ""
                        }`}
                      >
                        <Link href={`/requester/requests/${req.id}#feedback`}>
                          <Star
                            className="h-3 w-3"
                            fill={req.hasFeedback ? "currentColor" : "none"}
                          />
                          Rate
                        </Link>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4"
        >
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-10" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-0">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-3.5 border-b border-slate-50 last:border-0"
        >
          <Skeleton className="h-4 w-28 shrink-0" />
          <Skeleton className="h-5 w-14 rounded-full shrink-0" />
          <Skeleton className="h-4 w-20 shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-28 shrink-0" />
          <Skeleton className="h-5 w-24 rounded-full shrink-0" />
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          <Skeleton className="h-7 w-16 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RequesterDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: dbUser } = await supabase
    .from("users")
    .select("id, full_name, role, signup_status")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser || dbUser.signup_status !== "approved")
    redirect("/pending-approval");
  if (!isRequesterRole(dbUser.role)) redirect(getRoleDashboard(dbUser.role));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Requests
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track and manage your maintenance requests
          </p>
        </div>
        <Button
          asChild
          className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 gap-2"
        >
          <Link href="/requester/requests/new">
            <Plus className="h-4 w-4" />
            Submit New Request
          </Link>
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsRow />
      </Suspense>

      {/* ── Request History ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        {/* Table header row */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white text-base">
            Request History
          </h2>
          <div className="flex items-center gap-3">
            {/* Search bar (visual) */}
            <div className="relative hidden sm:block">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                readOnly
                placeholder="Search requests..."
                className="h-8 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 placeholder:text-slate-400 cursor-default focus:outline-none w-44"
              />
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 h-8"
            >
              <Link href="/requester/requests">View all</Link>
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="px-5 py-2">
          <Suspense fallback={<TableSkeleton />}>
            <RequestHistoryTable />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
