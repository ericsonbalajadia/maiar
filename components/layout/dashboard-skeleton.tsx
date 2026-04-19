// components/layout/dashboard-skeleton.tsx

export function DashboardSkeleton() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50/80 dark:bg-slate-900/80">

      {/* ── Sidebar skeleton (glass) ── */}
      <div className="sidebar-glass w-64 border-r border-white/20 dark:border-white/5 flex flex-col h-full shrink-0">
        {/* Logo area */}
        <div className="px-5 pt-5 pb-4 border-b border-white/20 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-16 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-2.5 w-20 bg-slate-100 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 px-3 py-3 space-y-1">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="w-4 h-4 rounded-md bg-slate-200 animate-pulse shrink-0"
                style={{ animationDelay: `${i * 60}ms` }}
              />
              <div
                className="h-3 rounded-full bg-slate-200 animate-pulse flex-1"
                style={{
                  width: `${60 + Math.sin(i) * 20}%`,
                  animationDelay: `${i * 60 + 30}ms`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-white/20 dark:border-white/5">
          <div className="h-2.5 w-24 bg-slate-100 rounded-full animate-pulse" />
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header skeleton (glass) */}
        <div className="header-glass h-14 border-b border-white/20 dark:border-white/5 px-5 flex items-center justify-end gap-3 shrink-0">
          <div className="flex-1" />
          <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
          <div className="w-px h-5 bg-slate-200/50 dark:bg-slate-700/50" />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
            <div className="hidden sm:block space-y-1">
              <div className="h-3 w-24 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-2 w-14 bg-slate-100 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Page content skeleton */}
        <div className="flex-1 overflow-auto p-6 space-y-6 fade-in">

          <div className="space-y-2">
            <div className="h-2.5 w-16 bg-blue-100 rounded-full animate-pulse" />
            <div className="h-7 w-64 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-3.5 w-48 bg-slate-100 rounded-full animate-pulse" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/60 dark:border-slate-700/60 p-5 flex items-center gap-4 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 animate-pulse shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              </div>
              <div className="h-7 w-16 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
            </div>
            <div className="px-5 py-3 space-y-0">
              <div className="flex items-center gap-4 py-3 border-b border-slate-100/60 dark:border-slate-700/60">
                {[28, 14, 20, 32, 24, 20, 16].map((w, i) => (
                  <div key={i} className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse" style={{ width: `${w}%`, flexShrink: 0 }} />
                ))}
              </div>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3.5 border-b border-slate-50/60 dark:border-slate-700/60 last:border-0"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="h-6 w-28 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse shrink-0" />
                  <div className="h-5 w-14 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse shrink-0" />
                  <div className="h-3.5 w-20 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse shrink-0" />
                  <div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse flex-1" />
                  <div className="h-3.5 w-24 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse shrink-0" />
                  <div className="h-5 w-20 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse shrink-0" />
                  <div className="h-7 w-16 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}