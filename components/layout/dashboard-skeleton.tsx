// components/layout/dashboard-skeleton.tsx
export function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 p-4">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}