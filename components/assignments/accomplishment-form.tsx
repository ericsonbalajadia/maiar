// components/assignments/accomplishment-form.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { saveAccomplishment } from '@/actions/accomplishment.actions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ActionResult } from '@/lib/utils/errors';
import type { DbAccomplishment } from '@/types/models';

const INITIAL_STATE: ActionResult = { success: false, errors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Saving...' : 'Save Work Log'}
    </button>
  );
}

interface AccomplishmentFormProps {
  requestId: string;
  existingAccomplishment?: DbAccomplishment | null;
}

export function AccomplishmentForm({ requestId, existingAccomplishment }: AccomplishmentFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(saveAccomplishment, INITIAL_STATE);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800">Work Log</h3>
      <p className="text-sm text-slate-600">Record the start and finish times of your work.</p>

      <input type="hidden" name="request_id" value={requestId} />

      <div>
        <label htmlFor="started_at" className="block text-sm font-medium text-slate-700">
          Started at
        </label>
        <input
          type="datetime-local"
          id="started_at"
          name="started_at"
          defaultValue={existingAccomplishment?.started_at?.slice(0, 16) ?? ''}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div>
        <label htmlFor="finished_at" className="block text-sm font-medium text-slate-700">
          Finished at
        </label>
        <input
          type="datetime-local"
          id="finished_at"
          name="finished_at"
          defaultValue={existingAccomplishment?.finished_at?.slice(0, 16) ?? ''}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        {!state.success && state.errors?.finished_at && (
          <p className="mt-1 text-xs text-red-600">{state.errors.finished_at[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Notes <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={existingAccomplishment?.notes ?? ''}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm resize-none focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      {!state.success && state.errors?.form && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-xs text-red-700">{state.errors.form[0]}</p>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}