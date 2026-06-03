// app/(dashboard)/supervisor/account-requests/page.tsx
"use client";

import { useEffect, useState } from "react";
import { StaffActionButtons } from "./staff-action-buttons";
import {
  UserCheck, Users, Inbox, Calendar, Building2, Mail, ShieldCheck,
} from "lucide-react";

type PendingStaff = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string | null;
  created_at: string;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, string> = {
  technician: "bg-[#0D3311]/10 text-[#0D3311] border-[#0D3311]/20 dark:bg-white/[0.06] dark:text-emerald-300 dark:border-white/10",
  supervisor: "bg-[#0D3311]/10 text-[#0D3311] border-[#0D3311]/20 dark:bg-white/[0.06] dark:text-emerald-300 dark:border-white/10",
  clerk:      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50",
  staff:      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-white/[0.06] dark:text-blue-300 dark:border-blue-800/50",
};

const AVATAR_GRADIENTS = [
  "from-[#0D3311] to-[#0D3311]",
  "from-[#0D3311] to-[#0D3311]",
  "from-blue-500 to-indigo-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
];

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const getGradient = (name: string) =>
  AVATAR_GRADIENTS[(name.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length];

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="supervisor-surface rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-white/[0.08] rounded-full animate-pulse w-40" />
            <div className="h-3 bg-slate-100 dark:bg-white/[0.05] rounded-full animate-pulse w-56" />
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="h-8 w-20 bg-slate-100 dark:bg-white/[0.05] rounded-xl animate-pulse" />
            <div className="h-8 w-20 bg-slate-100 dark:bg-white/[0.05] rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupervisorAccountRequestsPage() {
  const [users, setUsers] = useState<PendingStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/supervisor/pending-staff")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUsers(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="supervisor-shell max-w-4xl mx-auto space-y-6 fade-in">

      {/* ── Page header ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0D3311] dark:text-emerald-300 mb-1">
          Supervisor · Account Requests
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Staff Account Requests
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {loading
            ? "Loading pending registrations…"
            : `${users.length} staff member${users.length !== 1 ? "s" : ""} awaiting approval`}
        </p>
      </div>

      {/* ── Summary chip ── */}
      {!loading && !error && users.length > 0 && (
        <div className="inline-flex items-center gap-2 rounded-xl bg-[#0D3311]/10 dark:bg-white/[0.06] border border-[#0D3311]/20 dark:border-white/10 px-3.5 py-2 text-sm font-semibold text-[#0D3311] dark:text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          {users.length} pending registration{users.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-900/20 px-5 py-4 text-sm text-rose-600 dark:text-rose-400">
          Failed to load: {error}
        </div>
      ) : users.length === 0 ? (
        <div
          className="supervisor-surface rounded-2xl border-dashed flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#0D3311]/10 dark:bg-white/[0.06] flex items-center justify-center mb-4">
            <UserCheck className="h-7 w-7 text-[#0D3311]" />
          </div>
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
            All registrations reviewed
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            No pending staff account requests.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user, i) => {
            const initials = getInitials(user.full_name);
            const gradient = getGradient(user.full_name);
            const roleStyle =
              ROLE_STYLES[user.role] ??
              "bg-[#0D3311]/5 text-[#0D3311] border-[#0D3311]/15 dark:bg-white/[0.05] dark:text-slate-400 dark:border-white/10";
            const roleDisplay =
              user.role.charAt(0).toUpperCase() + user.role.slice(1);

            return (
              <div
                key={user.id}
                className="supervisor-surface rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 fade-in"
                style={{
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: "forwards",
                  opacity: 0,
                }}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm bg-gradient-to-br ${gradient}`}
                    >
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {user.full_name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        {/* Action buttons */}
                        <StaffActionButtons
                          userId={user.id}
                          onSuccess={() =>
                            setUsers(users.filter((u) => u.id !== user.id))
                          }
                        />
                      </div>

                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span
                          className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${roleStyle}`}
                        >
                          {roleDisplay}
                        </span>

                        {user.department && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded-full">
                            <Building2 className="h-2.5 w-2.5" />
                            {user.department}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 ml-auto">
                          <Calendar className="h-2.5 w-2.5" />
                          Registered{" "}
                          {new Date(user.created_at).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
