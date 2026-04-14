// components/assignments/verify-accomplishment-form.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { verifyAccomplishment } from '@/actions/accomplishment.actions';
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
      {pending ? 'Verifying...' : 'Confirm & Complete Request'}
    </button>
  );
}

interface VerifyAccomplishmentFormProps {
  accomplishmentId: string;
  requestId: string;
  finishedAt: string | null; // ISO string or null
}

export function VerifyAccomplishmentForm({
  accomplishmentId,
  requestId,
  finishedAt,
}: VerifyAccomplishmentFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(verifyAccomplishment, INITIAL_STATE);

  // Redirect to supervisor dashboard on success
  useEffect(() => {
    if (state.success) {
      router.push('/supervisor');
      router.refresh();
    }
  }, [state.success, router]);

  // If finishedAt is not set, the page should not render this form,
  // but we guard anyway.
  if (!finishedAt) {
    return (
      <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        The work finish time must be recorded before verification.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="accomplishment_id" value={accomplishmentId} />
      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="finished_at" value={finishedAt} />

      {/* Optional notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Verification Notes <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm resize-none focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      {/* Global form error */}
      {!state.success && state.errors?.form && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-xs text-red-700">{state.errors.form[0]}</p>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}