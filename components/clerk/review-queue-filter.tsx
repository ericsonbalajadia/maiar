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
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Request Type:</span>
      <div className="flex gap-2">
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
                ? 'bg-blue-600 text-white'
                : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}