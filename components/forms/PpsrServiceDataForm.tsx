// components/forms/PpsrServiceDataForm.tsx
'use client';

import { PPSR_SERVICE_FIELDS } from '@/lib/constants/ppsr-service-types';
import type { PpsrServiceType } from '@/lib/constants/ppsr-service-types';

interface Props {
  serviceType: PpsrServiceType;
}

const NUMERIC_FIELDS = [
  'estimated_duration_hrs',
  'estimated_passing_trips',
  'number_of_tents',
  'manpower_required',
];
const TEXTAREA_FIELDS = ['specify'];

export function PpsrServiceDataForm({ serviceType }: Props) {
  const fields = PPSR_SERVICE_FIELDS[serviceType] ?? [];

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const label = field
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        const name = `sd_${field}`;

        // Boolean (checkbox)
        if (field === 'with_lights') {
          return (
            <label key={field} className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name={name}
                value="true"
                className="h-4 w-4 rounded border-slate-300 text-teal-600"
              />
              {label}
            </label>
          );
        }

        // Numeric
        if (NUMERIC_FIELDS.includes(field)) {
          return (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700">{label}</label>
              <input
                type="number"
                name={name}
                min="0"
                step="0.5"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          );
        }

        // Datetime
        if (field === 'date_time_needed') {
          return (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700">{label}</label>
              <input
                type="datetime-local"
                name={name}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          );
        }

        // Textarea (description fields or 'specify')
        if (field.startsWith('description') || TEXTAREA_FIELDS.includes(field)) {
          return (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700">{label}</label>
              <textarea
                name={name}
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          );
        }

        // Default: text input
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <input
              type="text"
              name={name}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        );
      })}
    </div>
  );
}