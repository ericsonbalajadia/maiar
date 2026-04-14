// components/assignments/acceptance-form.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateAcceptanceStatus } from '@/actions/assignment.actions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ActionResult } from '@/lib/utils/errors';

const INITIAL_STATE: ActionResult = { success: false, errors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Submitting...' : 'Confirm'}
    </button>
  );
}

interface AcceptanceFormProps {
  requestId: string;
  assignmentId: string; // required – must be passed from parent
}

export function AcceptanceForm({ requestId, assignmentId }: AcceptanceFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateAcceptanceStatus, INITIAL_STATE);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800">Assignment Response</h3>
      <p className="text-sm text-slate-600">Please accept or reject this assignment.</p>

      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="assignment_id" value={assignmentId} />

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="acceptance_status"
            value="accepted"
            required
            className="h-4 w-4 border-slate-300 text-teal-600"
          />
          <span className="text-sm text-slate-700">Accept</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="acceptance_status"
            value="rejected"
            className="h-4 w-4 border-slate-300 text-teal-600"
          />
          <span className="text-sm text-slate-700">Reject</span>
        </label>
      </div>
      {!state.success && state.errors?.acceptance_status && (
        <p className="text-xs text-red-600">{state.errors.acceptance_status[0]}</p>
      )}

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Notes <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
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