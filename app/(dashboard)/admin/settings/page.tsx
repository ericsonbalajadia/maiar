import { getAuthUser } from "@/lib/auth";
import { ROLES } from "@/lib/rbac";
import { Settings } from "lucide-react";

export default async function AdminSettingsPage() {
  await getAuthUser([ROLES.ADMIN]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      <div>
        <p className="text-xs font-semibold uppercase text-rose-500">Admin</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Global configuration (coming soon).</p>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
        <Settings className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-500">Settings page is under development.</p>
        <p className="text-xs text-slate-400 mt-1">Feature will be implemented in a future release.</p>
      </div>
    </div>
  );
}