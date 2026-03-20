// components/feedback/star-rating.tsx
'use client';

interface Props {
  name: string;
  required?: boolean;
}

export function StarRating({ name, required }: Props) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <label key={value} className="flex flex-col items-center gap-1 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={value}
            required={required}
            className="sr-only peer"
          />
          <span className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-300 text-sm text-slate-600 peer-checked:border-teal-500 peer-checked:bg-teal-50 peer-checked:text-teal-700 peer-checked:font-bold hover:border-teal-400 transition-colors">
            {value}
          </span>
        </label>
      ))}
    </div>
  );
}