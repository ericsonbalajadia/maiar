// app/(dashboard)/admin/page.tsx
import { getAuthUser } from "@/lib/auth";
import { ROLES } from "@/lib/rbac";
import {
  getBacklogCounts,
  getTechnicianWorkload,
  getUserSummary,
} from "@/lib/queries/request.queries";
import {
  Users, ClipboardList, Wrench, TrendingUp, ShieldCheck,
  Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight,
  User, Briefcase,
} from "lucide-react";
import Link from "next/link";

// ─── Stat card (clean, minimal) ──────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  valueColor,
  sub,
  href,
  delay = 0,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconColor: string;
  valueColor?: string;
  sub?: string;
  href?: string;
  delay?: number;
}) {
  const inner = (
    <div
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-all hover:shadow-md hover:-translate-y-0.5 fade-in flex flex-col h-full"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards", opacity: 0 }}
    >
      <div className="flex items-start justify-between flex-1">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className={`text-3xl font-bold mt-1 tracking-tight ${valueColor || "text-slate-900 dark:text-white"}`}>
            {value}
          </p>
          {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-2 rounded-xl ${iconColor}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {/* Always render arrow spacer to keep consistent height */}
      <div className={`mt-3 flex justify-end ${!href ? "invisible" : ""}`}>
        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-500 transition-colors" />
      </div>
    </div>
  );
  if (href) return <Link href={href} className="block group h-full">{inner}</Link>;
  return inner;
}

// ─── Backlog card (horizontal row item) ───────────────────────────────────────

function BacklogCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50">
      <div className={`p-1.5 rounded-lg shrink-0 ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}

// ─── Quick action card ────────────────────────────────────────────────────────

function QuickAction({
  href,
  icon: Icon,
  iconColor,
  label,
  description,
  badge,
}: {
  href: string;
  icon: React.ElementType;
  iconColor: string;
  label: string;
  description: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all hover:shadow-md group"
    >
      <div className={`p-2 rounded-lg shrink-0 ${iconColor}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
          {badge !== undefined && badge > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-slate-500 transition-colors mt-1" />
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const { profile } = await getAuthUser([ROLES.ADMIN]);

  const [backlog, technicianData, userSummary] = await Promise.all([
    getBacklogCounts(),
    getTechnicianWorkload(),
    getUserSummary(),
  ]);

  const b = backlog.data;
  const totalActive =
    (b?.pending ?? 0) + (b?.under_review ?? 0) + (b?.approved ?? 0) +
    (b?.assigned ?? 0) + (b?.in_progress ?? 0);

  const firstName = profile.full_name?.split(" ")[0] ?? "Admin";

  return (
    <div className="max-w-7xl mx-auto space-y-8 fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-500 dark:text-rose-400">
            Admin Dashboard
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            System overview and management controls
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Users"
          value={userSummary.total}
          icon={Users}
          iconColor="bg-rose-500"
          valueColor="text-rose-600 dark:text-rose-400"
          href="/admin/users"
        />
        <StatCard
          label="Pending Approvals"
          value={userSummary.pendingApprovals}
          icon={ShieldCheck}
          iconColor="bg-amber-500"
          valueColor="text-amber-600 dark:text-amber-400"
          sub="Require review"
          href="/admin/users/pending"
        />
        <StatCard
          label="Active Requests"
          value={totalActive}
          icon={ClipboardList}
          iconColor="bg-blue-500"
          valueColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Completed this month"
          value={b?.completed ?? 0}
          icon={CheckCircle2}
          iconColor="bg-emerald-500"
          valueColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Request Backlog (full width, horizontal row) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-slate-500" />
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Request Backlog
              </h2>
            </div>
            <Link
              href="/admin/analytics/reports"
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline"
            >
              Full report →
            </Link>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <BacklogCard
              label="Pending + Review"
              value={(b?.pending ?? 0) + (b?.under_review ?? 0)}
              color="bg-amber-500"
              icon={Clock}
            />
            <BacklogCard
              label="Approved"
              value={b?.approved ?? 0}
              color="bg-teal-500"
              icon={CheckCircle2}
            />
            <BacklogCard
              label="Assigned"
              value={b?.assigned ?? 0}
              color="bg-blue-500"
              icon={Wrench}
            />
            <BacklogCard
              label="In Progress"
              value={b?.in_progress ?? 0}
              color="bg-violet-500"
              icon={TrendingUp}
            />
            <BacklogCard
              label="Cancelled"
              value={b?.cancelled ?? 0}
              color="bg-slate-400"
              icon={XCircle}
            />
          </div>
        </div>
      </div>

      {/* Two‑column: Users by Role + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Users by Role */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500" />
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Users by Role
              </h2>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {Object.entries(userSummary.byRole).map(([role, count]) => {
              const roleIcons: Record<string, React.ElementType> = {
                student: User, staff: Briefcase, clerk: ShieldCheck,
                technician: Wrench, supervisor: Users, admin: ShieldCheck,
              };
              const Icon = roleIcons[role] ?? Users;
              const colors: Record<string, string> = {
                student: "text-blue-600 bg-blue-50",
                staff: "text-indigo-600 bg-indigo-50",
                clerk: "text-amber-600 bg-amber-50",
                technician: "text-teal-600 bg-teal-50",
                supervisor: "text-violet-600 bg-violet-50",
                admin: "text-rose-600 bg-rose-50",
              };
              const colorClass = colors[role] || "text-slate-600 bg-slate-50";
              const pct = userSummary.total > 0 ? Math.round(((count as number) / userSummary.total) * 100) : 0;
              return (
                <div key={role} className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${colorClass} shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium capitalize text-slate-700 dark:text-slate-300">{role}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{count}</span>
                    </div>
                    <div className="mt-1.5 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${colorClass}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-slate-500" />
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  Quick Actions
                </h2>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <QuickAction
                href="/admin/users/pending"
                icon={ShieldCheck}
                iconColor="bg-amber-500"
                label="Pending Approvals"
                description="Review and approve user registrations"
                badge={userSummary.pendingApprovals}
              />
              <QuickAction
                href="/admin/analytics/reports"
                icon={TrendingUp}
                iconColor="bg-blue-500"
                label="Reports & Analytics"
                description="Backlog, workload, user summary"
              />
              <QuickAction
                href="/admin/analytics/feedback"
                icon={ClipboardList}
                iconColor="bg-emerald-500"
                label="Feedback Analytics"
                description="Service satisfaction and ratings"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pending approvals alert (if any) */}
      {userSummary.pendingApprovals > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {userSummary.pendingApprovals} user{userSummary.pendingApprovals !== 1 ? "s" : ""} awaiting approval
              </p>
              <Link
                href="/admin/users/pending"
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 mt-1"
              >
                Review now <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}