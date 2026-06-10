import { getAuthUser } from "@/lib/auth";
import { SUPERVISOR_ASSIGNMENT_ROLES } from "@/lib/rbac";
import { getRequestsForSupervisor } from "@/lib/queries/request.queries";
import { RequestCard } from "@/components/requests/request-card";
import {
  ArrowUpRight,
  ClipboardCheck,
  CheckCircle2,
  TrendingUp,
  UsersRound,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";

type SupervisorRequest = {
  id: string;
  ticket_number: string | null;
  title: string;
  request_type: string;
  created_at: string;
  status: { status_name: string };
  priority: { level: string };
  location: { building_name: string };
};

function AssignmentLane({
  title,
  description,
  icon: Icon,
  items,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  items: SupervisorRequest[];
}) {
  const visibleItems = items.slice(0, 4);

  return (
    <section className="min-w-0 space-y-3">
      <div className="flex items-start justify-between gap-3 border-b border-[#0D3311]/15 dark:border-white/10 pb-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0D3311]/10 dark:bg-white/[0.06]">
            <Icon className="h-4 w-4 text-[#0D3311] dark:text-emerald-300" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>
        <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-[#0D3311]/10 px-2 py-1 text-xs font-bold text-[#0D3311] dark:bg-white/[0.06] dark:text-emerald-300">
          {items.length}
        </span>
      </div>

      {visibleItems.length > 0 ? (
        <div className="space-y-3">
          {visibleItems.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              fullHref={`/supervisor/requests/${request.id}`}
              hideStatus
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#0D3311]/20 dark:border-white/10 px-4 py-8 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            No requests in this lane.
          </p>
        </div>
      )}

      {items.length > visibleItems.length && (
        <Link
          href="/supervisor/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D3311] dark:text-emerald-300 hover:underline"
        >
          View {items.length - visibleItems.length} more
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      )}
    </section>
  );
}

export default async function SupervisorDashboardPage() {
  await getAuthUser(SUPERVISOR_ASSIGNMENT_ROLES);
  const { data: requests } = await getRequestsForSupervisor();

  const grouped = {
    approved:    requests?.filter((r) => r.status.status_name === "approved")    ?? [],
    assigned:    requests?.filter((r) => r.status.status_name === "assigned")    ?? [],
    in_progress: requests?.filter((r) => r.status.status_name === "in_progress") ?? [],
  };

  const totalActive = grouped.approved.length + grouped.assigned.length + grouped.in_progress.length;
  const overviewStats = [
    {
      label: "Active Maintenance",
      value: totalActive,
      icon: ClipboardCheck,
    },
    {
      label: "Awaiting Assignment",
      value: grouped.approved.length,
      icon: UsersRound,
    },
    {
      label: "Work In Progress",
      value: grouped.in_progress.length,
      icon: TrendingUp,
    },
  ];
  const lanes = [
    {
      title: "Awaiting Assignment",
      description: "Approved requests awaiting technician assignment",
      icon: CheckCircle2,
      items: grouped.approved,
    },
    {
      title: "Assigned",
      description: "Technician assigned, work not yet started",
      icon: Wrench,
      items: grouped.assigned,
    },
    {
      title: "Work In Progress",
      description: "Ongoing work requiring supervision",
      icon: Zap,
      items: grouped.in_progress,
    },
  ];

  return (
    <div className="supervisor-shell mx-auto max-w-7xl space-y-7 px-4 md:px-6 fade-in">
      {/* Page header */}
      <div className="supervisor-surface overflow-hidden rounded-2xl">
        <div className="p-5 md:p-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Service Operations
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Oversee technician assignments and active maintenance work.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-[#0D3311]/15 dark:border-white/10 divide-y sm:divide-x sm:divide-y-0 divide-[#0D3311]/15 dark:divide-white/10">
          {overviewStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-4 md:px-6 md:py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0D3311]/10 dark:bg-white/[0.06]">
                    <Icon className="h-4 w-4 text-[#0D3311] dark:text-emerald-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0D3311] dark:text-emerald-300">
              Maintenance Queue
            </p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Assignment Status
            </h2>
          </div>
          <Link
            href="/supervisor/requests"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D3311] dark:text-emerald-300 hover:underline"
          >
            View full queue
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="supervisor-surface overflow-hidden rounded-2xl">
          <div className="grid gap-0 lg:grid-cols-3 lg:divide-x lg:divide-[#0D3311]/15 lg:dark:divide-white/10">
            {lanes.map((lane) => (
              <div key={lane.title} className="border-b border-[#0D3311]/15 p-4 last:border-b-0 dark:border-white/10 lg:border-b-0 lg:p-5">
                <AssignmentLane {...lane} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
