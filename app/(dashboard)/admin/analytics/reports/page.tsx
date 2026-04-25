// app/(dashboard)/admin/analytics/reports/page.tsx
import {
  getBacklogCounts,
  getTechnicianWorkload,
  getUserSummary,
} from "@/lib/queries/request.queries";
import {
  Users, ClipboardList, Wrench, Clock, CheckCircle2,
  XCircle, TrendingUp, AlertTriangle, BarChart3,
} from "lucide-react";
import Link from "next/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function GlassSection({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-white/60 dark:border-slate-700/60 overflow-hidden shadow-sm"
      style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)" }}
    >
      {children}
    </div>
  );
}

function GlassSectionHeader({
  icon: Icon,
  iconGradient,
  title,
}: {
  icon: React.ElementType;
  iconGradient: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100/80 dark:border-slate-800/60 bg-white/30 dark:bg-slate-900/30">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${iconGradient}`}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h3>
    </div>
  );
}

function BacklogCard({
  label,
  value,
  icon: Icon,
  bg,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  bg: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className={`w-8 h-8 rounded-lg ${bg.replace("50", "100").replace("900/20", "900/40")} flex items-center justify-center mb-3`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReportsPage() {
  const [backlog, technicians, userSummary] = await Promise.all([
    getBacklogCounts(),
    getTechnicianWorkload(),
    getUserSummary(),
  ]);

  const b = backlog.data;

  const backlogItems = [
    {
      label: "Pending + Under Review",
      value: (b?.pending ?? 0) + (b?.under_review ?? 0),
      icon: Clock,
      bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200/60 dark:border-amber-800/40",
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Approved (Awaiting Assignment)",
      value: b?.approved ?? 0,
      icon: CheckCircle2,
      bg: "bg-teal-50 dark:bg-teal-900/20 border-teal-200/60 dark:border-teal-800/40",
      color: "text-teal-600 dark:text-teal-400",
    },
    {
      label: "Assigned",
      value: b?.assigned ?? 0,
      icon: Wrench,
      bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200/60 dark:border-blue-800/40",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "In Progress",
      value: b?.in_progress ?? 0,
      icon: TrendingUp,
      bg: "bg-violet-50 dark:bg-violet-900/20 border-violet-200/60 dark:border-violet-800/40",
      color: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Completed",
      value: b?.completed ?? 0,
      icon: CheckCircle2,
      bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-800/40",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Cancelled",
      value: b?.cancelled ?? 0,
      icon: XCircle,
      bg: "bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/50",
      color: "text-slate-500 dark:text-slate-400",
    },
  ];

  const ROLE_COLORS: Record<string, string> = {
    student: "bg-blue-500", staff: "bg-indigo-500",
    clerk: "bg-amber-500", technician: "bg-teal-500",
    supervisor: "bg-violet-500", admin: "bg-rose-500",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 fade-in">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-500 dark:text-rose-400 mb-1">
            Admin · Analytics
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Reports &amp; Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            System-wide operational metrics and workload data.
          </p>
        </div>
        <div className="flex gap-2 self-start shrink-0">
          <Link
            href="/admin/analytics/feedback"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Feedback Analytics
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* ── Backlog ── */}
      <GlassSection>
        <GlassSectionHeader
          icon={ClipboardList}
          iconGradient="bg-gradient-to-br from-rose-500 to-pink-600"
          title="Backlog Analysis"
        />
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {backlogItems.map((item) => (
              <BacklogCard key={item.label} {...item} />
            ))}
          </div>
        </div>
      </GlassSection>

      {/* ── Technician workload ── */}
      <GlassSection>
        <GlassSectionHeader
          icon={Wrench}
          iconGradient="bg-gradient-to-br from-teal-400 to-emerald-600"
          title="Technician Workload Balance"
        />
        <div className="overflow-x-auto">
          {!technicians.data?.length ? (
            <div className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              No technicians found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                  {["Name", "Specialization", "Active Assignments"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide px-5 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                {technicians.data.map((tech: any, i: number) => (
                  <tr
                    key={tech.id}
                    className={i % 2 === 0 ? "" : "bg-slate-50/30 dark:bg-slate-800/10"}
                  >
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {tech.name}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50 px-2 py-0.5 rounded-full capitalize">
                        {tech.specialization}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[120px] bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
                            style={{
                              width: `${Math.min(100, (tech.activeAssignments / 5) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {tech.activeAssignments}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassSection>

      {/* ── User summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Total users */}
        <div
          className="relative overflow-hidden rounded-2xl border border-white/60 dark:border-slate-700/60 p-5"
          style={{ background: "var(--gradient-card)", backdropFilter: "blur(12px)" }}
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-xl bg-rose-500" />
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-3 shadow-sm">
            <Users className="h-5 w-5 text-white" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {userSummary.total}
          </p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Total Users
          </p>
        </div>

        {/* Pending approvals */}
        <div
          className="relative overflow-hidden rounded-2xl border border-white/60 dark:border-slate-700/60 p-5"
          style={{ background: "var(--gradient-card)", backdropFilter: "blur(12px)" }}
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-xl bg-amber-500" />
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {userSummary.pendingApprovals}
          </p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Pending Approvals
          </p>
          {userSummary.pendingApprovals > 0 && (
            <Link
              href="/admin/users/pending"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline mt-2"
            >
              Review now →
            </Link>
          )}
        </div>

        {/* Role breakdown */}
        <GlassSection>
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100/80 dark:border-slate-800/60 bg-white/30 dark:bg-slate-900/30">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
              <Users className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">Role Breakdown</h3>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(userSummary.byRole).map(([role, count]) => {
              const color = ROLE_COLORS[role] ?? "bg-slate-400";
              const pct =
                userSummary.total > 0
                  ? Math.round(((count as number) / userSummary.total) * 100)
                  : 0;
              return (
                <div key={role} className="flex items-center gap-2.5">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize w-20 shrink-0">
                    {role}
                  </span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-5 text-right tabular-nums">
                    {count as number}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassSection>
      </div>
    </div>
  );
}