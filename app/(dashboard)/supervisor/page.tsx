import { getAuthUser } from "@/lib/auth";
import { SUPERVISOR_ASSIGNMENT_ROLES } from "@/lib/rbac";
import { getRequestsForSupervisor } from "@/lib/queries/request.queries";
import { ScrollableRow } from "@/components/supervisor/scrollable-row";
import { SECTIONS } from "@/components/supervisor/constants";
import { Eye, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function SupervisorDashboardPage() {
  await getAuthUser(SUPERVISOR_ASSIGNMENT_ROLES);
  const { data: requests } = await getRequestsForSupervisor();

  const grouped = {
    approved:    requests?.filter((r) => r.status.status_name === "approved")    ?? [],
    assigned:    requests?.filter((r) => r.status.status_name === "assigned")    ?? [],
    in_progress: requests?.filter((r) => r.status.status_name === "in_progress") ?? [],
  };

  const totalActive = grouped.approved.length + grouped.assigned.length + grouped.in_progress.length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto fade-in px-4 md:px-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
            Supervisor
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Assignment Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Requests awaiting assignment, scheduling, or verification
          </p>
        </div>
        <div className="flex items-center gap-2 self-start shrink-0">
          <Link
            href="/supervisor/requests"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Eye className="h-4 w-4" />
            All Requests
          </Link>
          <Link
            href="/supervisor/analytics/feedback"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <TrendingUp className="h-4 w-4" />
            Analytics
          </Link>
        </div>
      </div>

      {/* Summary chips */}
      {totalActive > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {SECTIONS.map((s) => {
            const count = grouped[s.key as keyof typeof grouped].length;
            if (count === 0) return null;
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium ${s.chipBg}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {count} {s.label.toLowerCase()}
              </div>
            );
          })}
        </div>
      )}

      {/* Scrollable rows */}
      <ScrollableRow items={grouped.approved} sectionKey="approved" />
      <ScrollableRow items={grouped.assigned} sectionKey="assigned" />
      <ScrollableRow items={grouped.in_progress} sectionKey="in_progress" />
    </div>
  );
}