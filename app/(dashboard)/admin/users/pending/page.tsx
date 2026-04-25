// app/(dashboard)/admin/users/pending/page.tsx
"use client";

import { useEffect, useState } from "react";
import { UserActionButtons } from "./user-action-button";
import {
  ShieldCheck, Users, UserCheck, Mail, Building2, Calendar, AlertTriangle,
} from "lucide-react";

type PendingUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string | null;
  created_at: string;
};

// ─── Role style map ───────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, string> = {
  student:    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50",
  staff:      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50",
  clerk:      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50",
  technician: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800/50",
  supervisor: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800/50",
};

const AVATAR_GRADIENTS = [
  "from-rose-500 to-pink-600",
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-teal-400 to-emerald-600",
  "from-amber-400 to-orange-500",
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
          className="rounded-2xl border border-white/60 dark:border-slate-700/60 p-5 flex items-center gap-4"
          style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)" }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse w-40" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse w-56" />
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PendingApprovalsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pending-users")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUsers(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">

      {/* ── Page header ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500 dark:text-rose-400 mb-1">
          Admin · User Management
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Pending Approvals
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {loading
            ? "Loading pending registrations…"
            : `${users.length} user${users.length !== 1 ? "s" : ""} awaiting approval`}
        </p>
      </div>

      {/* ── Alert chip ── */}
      {!loading && !error && users.length > 0 && (
        <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40 px-3.5 py-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5" />
          {users.length} registration{users.length !== 1 ? "s" : ""} pending
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
          className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center py-16 text-center"
          style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)" }}
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
            <UserCheck className="h-7 w-7 text-emerald-500" />
          </div>
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
            All registrations reviewed
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            No users are pending approval.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user, i) => {
            const initials = getInitials(user.full_name);
            const gradient = getGradient(user.full_name);
            const roleStyle =
              ROLE_STYLES[user.role] ??
              "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/50";
            const roleDisplay =
              user.role.charAt(0).toUpperCase() + user.role.slice(1);

            return (
              <div
                key={user.id}
                className="rounded-2xl border border-white/60 dark:border-slate-700/60 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 fade-in"
                style={{
                  background: "var(--glass-bg)",
                  backdropFilter: "blur(12px)",
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
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        {/* Action buttons */}
                        <UserActionButtons userId={user.id} />
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span
                          className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${roleStyle}`}
                        >
                          {roleDisplay}
                        </span>
                        {user.department && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-full">
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