// app/(dashboard)/clerk/skeleton.tsx
import { ClipboardCheck, Clock, Eye } from "lucide-react";

export function ClerkDashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto fade-in px-4 md:px-6">
      {/* Page header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
        </div>
        <div className="h-9 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      </div>

      {/* Summary chips skeleton */}
      <div className="flex flex-wrap gap-3">
        <div className="h-8 w-28 bg-amber-100 dark:bg-amber-900/20 rounded-xl animate-pulse" />
        <div className="h-8 w-32 bg-blue-100 dark:bg-blue-900/20 rounded-xl animate-pulse" />
      </div>

      {/* Two‑column grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending column */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/20 animate-pulse" />
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
            <div className="h-5 w-8 bg-amber-100 dark:bg-amber-900/20 rounded-full animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/60 dark:border-slate-700/60 overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm animate-pulse"
              >
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    </div>
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                  <div className="flex gap-2">
                    <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  </div>
                </div>
                <div className="border-t border-slate-100/80 dark:border-slate-800/60 px-4 py-3 bg-slate-50/40 dark:bg-slate-900/20">
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Under Review column */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/20 animate-pulse" />
            <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
            <div className="h-5 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-full animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/60 dark:border-slate-700/60 overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm animate-pulse"
              >
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    </div>
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                  <div className="flex gap-2">
                    <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  </div>
                </div>
                <div className="border-t border-slate-100/80 dark:border-slate-800/60 px-4 py-3 bg-slate-50/40 dark:bg-slate-900/20">
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <div className="h-5 w-44 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}