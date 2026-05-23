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
  InboxIcon,
  ChevronRight,
  ArrowRight,
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

// ─── Stat Card (simplified, always visible) ──────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  iconColor,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  sub?: string;
}) {
  return (
    <div className="requester-surface flex min-h-[112px] items-center gap-4 rounded-xl p-4 transition-colors duration-150 ease-in-out">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${gradient}`}
      >
        <Icon className={`h-[18px] w-[18px] ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold leading-none tabular-nums text-[#0b130b] dark:text-white">
          {value}
        </p>
        <p className="mt-2 text-[13px] font-normal text-[#0b130b]/70 dark:text-white/70">
          {label}
        </p>
        {sub && (
          <p className="mt-1 text-[11px] font-normal text-[#0b130b]/40 dark:text-white/40">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Stats Row (unchanged, just uses the new StatCard) ────────────────────────

async function StatsRow() {
  const stats = await getRequesterStats();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Requests"
        value={stats.total}
        icon={ClipboardList}
        gradient="bg-[#ADEBB3]/15"
        iconColor="text-[#527255] dark:text-emerald-300"
      />
      <StatCard
        label="Pending"
        value={stats.pending}
        icon={Clock}
        gradient="bg-[#ADEBB3]/15"
        iconColor="text-amber-400 dark:text-amber-300"
      />
      <StatCard
        label="In Progress"
        value={stats.inProgress}
        icon={Wrench}
        gradient="bg-[#ADEBB3]/15"
        iconColor="text-sky-400 dark:text-sky-300"
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        icon={CheckCircle2}
        gradient="bg-[#ADEBB3]/15"
        iconColor="text-[#8dc192] dark:text-emerald-300"
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

type RecentRequestRow = Omit<RecentRequest, "hasFeedback"> & {
  hasFeedback?: boolean;
};

function RequestTypePill({ type }: { type: string }) {
  const normalized = type.toLowerCase();
  const isPpsr = normalized === "ppsr";

  return (
    <span
      className={
        isPpsr
          ? "inline-flex h-[22px] items-center rounded-full bg-purple-500/15 px-2.5 text-[11px] font-medium text-purple-600 dark:text-purple-300"
          : "inline-flex h-[22px] items-center rounded-full bg-[#ADEBB3]/35 px-2.5 text-[11px] font-medium text-[#527255] dark:bg-white/[0.05] dark:text-emerald-300"
      }
    >
      {isPpsr ? "PPSR" : "R&M"}
    </span>
  );
}

function RequestStatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase().replace(/\s+/g, "_");
  const label = normalized
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const styles =
    normalized === "completed"
      ? "bg-[#8dc192]/20 text-[#374e39] dark:bg-[#8dc192]/[0.12] dark:text-emerald-300"
      : normalized === "cancelled" || normalized === "rejected" || normalized === "under_review"
        ? "bg-rose-400/20 text-rose-700 dark:bg-rose-400/[0.12] dark:text-rose-300"
        : normalized === "in_progress" || normalized === "assigned" || normalized === "approved"
          ? "bg-sky-400/20 text-sky-700 dark:bg-sky-400/[0.12] dark:text-sky-300"
          : "bg-amber-400/20 text-amber-700 dark:bg-amber-400/[0.12] dark:text-amber-300";

  const dot =
    normalized === "completed"
      ? "bg-[#6f9873] dark:bg-emerald-300"
      : normalized === "cancelled" || normalized === "rejected" || normalized === "under_review"
        ? "bg-rose-600 dark:bg-rose-300"
        : normalized === "in_progress" || normalized === "assigned" || normalized === "approved"
          ? "bg-sky-600 dark:bg-sky-300"
          : "bg-amber-600 dark:bg-amber-300";

  return (
    <span className={`inline-flex h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

async function RequestHistoryTable() {
  const rawRequests = await getRecentRequests();
  const requests = (rawRequests as RecentRequestRow[]).map((req) => ({
    ...req,
    hasFeedback: req.hasFeedback ?? false,
  })) as RecentRequest[];

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mb-4">
          <InboxIcon className="h-7 w-7 text-slate-400" />
        </div>
        <p className="text-base font-semibold text-slate-700 dark:text-white/80 mb-1">
          No requests yet
        </p>
        <p className="text-sm text-slate-400 mb-5">
          Submit your first request to get started.
        </p>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="gap-2 rounded-lg border-[#ADEBB3]/70 bg-white text-slate-700 shadow-sm hover:border-[#ADEBB3]/70 hover:bg-[#ADEBB3]/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/90 dark:hover:border-[#ADEBB3]/80 dark:hover:bg-white/[0.08]"
        >
          <Link href="/requester/requests/new">
            <Plus className="h-4 w-4" />
            Submit New Request
          </Link>
        </Button>
      </div>
    );
  }

return (
  <div className="overflow-x-auto">
    <table className="w-full text-[13px]">
      <thead>
        <tr className="border-b border-[#ADEBB3]/70 dark:border-white/10">
          {[
            { label: "Ref #", tip: "Unique ticket reference number" },
            { label: "Type", tip: "R&M or Physical Plant Service" },
            { label: "Date", tip: "Date submitted" },
            { label: "Nature of Work", tip: "Category of the request" },
            { label: "Building", tip: "Location of the request" },
            { label: "Status", tip: "Current workflow status" },
            { label: "Action", tip: "" },
          ].map(({ label, tip }) => (
            <th
              key={label}
              className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.8px] text-[#0b130b]/45 first:pl-4 last:pr-4 dark:text-white/45"
              {...(tip ? { "data-tooltip": tip } : {})}
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#6f9873]/20 dark:divide-white/[0.06]">
        {requests.map((req) => {
          const statusName = req.statuses?.status_name?.toLowerCase() ?? "";
          const isCompleted = statusName === "completed";
          const location = req.locations?.building_name ?? "-";

          return (
            <tr
              key={req.id}
              className="group transition-colors duration-150 ease-in-out hover:bg-[#ADEBB3]/35 dark:hover:bg-white/[0.08]"
            >
              <td className="px-4 py-4">
                <span
                  className="font-mono text-[11.5px] font-normal text-[#527255] dark:text-emerald-300"
                  data-tooltip={req.ticket_number}
                >
                  {req.ticket_number}
                </span>
              </td>
              <td className="px-4 py-4">
                <RequestTypePill type={req.request_type} />
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-[13px] font-normal text-[#0b130b]/60 dark:text-white/55">
                {formatDate(req.created_at)}
              </td>
              <td className="max-w-[160px] px-4 py-4">
                <span
                  className="line-clamp-1 text-[13px] font-normal text-[#0b130b]/75 dark:text-white/70"
                  data-tooltip={req.categories?.category_name ?? req.title}
                >
                  {req.categories?.category_name ?? req.title}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-4">
                <span
                  className="text-[13px] font-normal text-[#0b130b]/60 dark:text-white/55"
                  data-tooltip={location}
                >
                  {location.length > 18 ? location.slice(0, 18) + "..." : location}
                </span>
              </td>
              <td className="px-4 py-4">
                <RequestStatusPill status={req.statuses?.status_name ?? "pending"} />
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-7 cursor-pointer gap-1 px-0 text-xs font-normal text-[#0b130b]/60 transition-colors duration-150 ease-in-out hover:bg-[#ADEBB3]/35 hover:text-[#527255] dark:text-white/50 dark:hover:text-emerald-300"
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
                      variant="ghost"
                      className={`h-7 cursor-pointer gap-1 px-0 text-xs font-normal transition-colors duration-150 ease-in-out hover:bg-[#ADEBB3]/35 ${
                        req.hasFeedback
                          ? "text-amber-400"
                          : "text-[#0b130b]/60 hover:text-[#527255] dark:text-white/50 dark:hover:text-emerald-300"
                      }`}
                      data-tooltip={
                        req.hasFeedback
                          ? "You've already rated this"
                          : "Rate this service"
                      }
                    >
                      <Link href={`/requester/requests/${req.id}#feedback`}>
                        <Star
                          className="h-3 w-3"
                          fill={req.hasFeedback ? "currentColor" : "none"}
                        />
                        {req.hasFeedback ? "Rated" : "Rate"}
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="requester-surface flex min-h-[112px] items-center gap-4 rounded-xl p-4"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
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
          className="flex items-center gap-4 border-b border-[#ADEBB3]/70 px-4 py-4 last:border-0 dark:border-white/10"
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

  const firstName = dbUser.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="requester-shell mx-auto max-w-6xl space-y-4 px-4 md:px-6">
      {/* Page header */}
      <div className="rounded-xl border border-[#ADEBB3]/70 bg-white/60 px-4 py-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div>
          <p className="mb-2 text-[10px] font-normal uppercase tracking-[1.5px] text-[#0b130b]/50 dark:text-white/50">
            Dashboard
          </p>
          <h1 className="text-xl font-medium text-[#0b130b] dark:text-white">
            Welcome back, {firstName} {"\uD83D\uDC4B"}
          </h1>
          <p className="mt-1 text-xs font-normal text-[#0b130b]/40 dark:text-white/40">
            Track and manage your maintenance requests below.
          </p>
        </div>
      </div>

      <Link
        href="/requester/requests/new"
        className="requester-button flex h-16 w-full cursor-pointer items-center justify-between rounded-xl px-4 text-left transition-colors duration-150 ease-in-out"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ADEBB3]/35 text-[#1e2c1f] dark:bg-white/[0.06] dark:text-emerald-300">
            <Plus className="h-4 w-4" />
          </span>
          <span className="flex min-w-0 flex-col items-start">
            <span className="text-sm font-medium text-[#0b130b] dark:text-white">
              Submit New Request
            </span>
            <span className="mt-1 text-[11px] font-normal text-[#0b130b]/45 dark:text-white/45">
              Create a repair or service ticket
            </span>
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-[#0b130b]/40 dark:text-white/40" />
      </Link>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsRow />
      </Suspense>

      <div className="requester-surface overflow-hidden rounded-xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#ADEBB3]/70 px-4 py-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ADEBB3]" />
            <h2 className="text-sm font-medium text-[#0b130b] dark:text-white">
              Recent Requests
            </h2>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 cursor-pointer gap-1 rounded-lg px-0 text-xs font-normal text-[#527255] transition-colors duration-150 ease-in-out hover:bg-[#ADEBB3]/35 hover:text-[#527255] dark:text-emerald-300 dark:hover:text-emerald-300"
          >
            <Link href="/requester/requests">
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
        <Suspense fallback={<TableSkeleton />}>
          <RequestHistoryTable />
        </Suspense>
      </div>
    </div>
  );
}
