// components/ui/StatusBadge.tsx
import { STATUS_STYLES } from '@/lib/utils/status';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const style = STATUS_STYLES[status] ?? {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };
  const label = status.replace(/_/g, ' ');
  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px} ${style.bg} ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}