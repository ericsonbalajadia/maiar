'use client';

interface Props {
  value?: number;          // for read‑only display
  readonly?: boolean;      // if true, show filled/empty stars
  name?: string;           // for interactive radio buttons
  required?: boolean;      // for interactive mode
  onChange?: (value: number) => void; // callback when star clicked (optional)
  labels?: Record<number, string>;   // descriptive labels for each value
}

export function StarRating({ value, readonly = false, name, required, onChange, labels }: Props) {
  const stars = [1, 2, 3, 4, 5];

  // Read‑only mode: display filled stars (no labels, as before)
  if (readonly) {
    return (
      <div className="flex gap-1">
        {stars.map((star) => (
          <span key={star} className="text-xl">
            {star <= (value || 0) ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  }

  // Interactive mode: radio buttons with numeric circles + optional labels below
  return (
    <div className="flex gap-4 flex-wrap">
      {stars.map((star) => (
        <label key={star} className="flex flex-col items-center gap-1 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={star}
            required={required}
            onChange={() => onChange?.(star)}
            className="sr-only peer"
          />
          <span className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-300 text-sm text-slate-600 peer-checked:border-teal-500 peer-checked:bg-teal-50 peer-checked:text-teal-700 peer-checked:font-bold hover:border-teal-400 transition-colors">
            {star}
          </span>
          {labels && (
            <span className="text-xs text-slate-500 text-center max-w-[80px] leading-tight">
              {labels[star]}
            </span>
          )}
        </label>
      ))}
    </div>
  );
}