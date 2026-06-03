'use client';

import { useRouter } from 'next/navigation';

interface Props {
  currentType: string;
}

export function ReviewQueueFilter({ currentType }: Props) {
  const router = useRouter();

  const setType = (type: string) => {
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
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
      {/* Type filter group – neutral slate active, green glass container */}
      <div className="flex items-center gap-1.5 rounded-full border border-[#ADEBB3]/70 bg-white/60 p-1 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.05]">
        {[
          { value: 'all', label: 'All' },
          { value: 'rmr', label: 'R&M' },
          { value: 'ppsr', label: 'PPSR' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setType(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              currentType === opt.value
                ? 'bg-slate-700 text-white shadow-sm hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500'
                : 'text-slate-700 dark:text-slate-300 hover:bg-[#ADEBB3]/35 hover:backdrop-blur-sm dark:hover:bg-white/[0.08]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Separator */}
      <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>

      {/* Status filter (currently unused, kept for future) */}
    </div>
  );
}