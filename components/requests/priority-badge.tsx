// components/ui/PriorityBadge.tsx
import { PRIORITY_STYLES } from '@/lib/utils/status';

interface Props {
  level: string;
}

export function PriorityBadge({ level }: Props) {
  const style = PRIORITY_STYLES[level] ?? {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}
    >
      {level}
    </span>
  );
}