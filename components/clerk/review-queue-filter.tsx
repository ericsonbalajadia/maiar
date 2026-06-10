//components/clerk/review-queue-filter.tsx:

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

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
                ? 'bg-[#58855C] text-white'
                : 'bg-white/50 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-[#58855C]/10 dark:hover:bg-white/[0.08]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}