'use client';

import { useRouter } from 'next/navigation';

interface Props {
  currentType: string;
  currentStatus: string;
}

export function ReviewQueueFilter({ currentType, currentStatus }: Props) {
  const router = useRouter();

  const setType = (type: string) => {
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (currentStatus !== 'all') params.set('status', currentStatus);
    router.push(`/clerk?${params.toString()}`);
  };

  const setStatus = (status: string) => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (currentType !== 'all') params.set('type', currentType);
    router.push(`/clerk?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {/* Type filter group */}
      <div className="flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-white/60 p-1 dark:border-slate-700/60 dark:bg-slate-800/60">
        {[
          { value: 'all', label: 'All' },
          { value: 'rmr', label: 'R&M' },
          { value: 'ppsr', label: 'PPSR' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setType(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentType === opt.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Separator (optional, visible on larger screens) */}
      <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>

      {/* Status filter group */}
      <div className="flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-white/60 p-1 dark:border-slate-700/60 dark:bg-slate-800/60">
        {[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'under_review', label: 'Under Review' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentStatus === opt.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}