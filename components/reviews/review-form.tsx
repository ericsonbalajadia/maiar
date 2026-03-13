// components/reviews/review-form.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitReview } from '@/actions/review.actions';
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
      {pending ? 'Submitting...' : 'Submit Review'}
    </button>
  );
}

interface ReviewFormProps {
  requestId: string;
}

export function ReviewForm({ requestId }: ReviewFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(submitReview, INITIAL_STATE);

  // Redirect to clerk dashboard on success
  useEffect(() => {
    if (state.success) {
      router.push('/clerk');
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="request_id" value={requestId} />

      {/* Decision radio group */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Decision</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="decision"
              value="approved"
              required
              className="h-4 w-4 border-slate-300 text-teal-600"
            />
            <span className="text-sm text-slate-700">Approve – request ready for assignment</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="decision"
              value="rejected"
              className="h-4 w-4 border-slate-300 text-teal-600"
            />
            <span className="text-sm text-slate-700">Reject – close request</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="decision"
              value="needs_info"
              className="h-4 w-4 border-slate-300 text-teal-600"
            />
            <span className="text-sm text-slate-700">Needs more info – requester to update</span>
          </label>
        </div>
        {!state.success && state.errors?.decision && (
          <p className="mt-1 text-xs text-red-600">{state.errors.decision[0]}</p>
        )}
      </div>

      {/* Review notes */}
      <div>
        <label htmlFor="review_notes" className="block text-sm font-medium text-slate-700">
          Review Notes
          <span className="ml-1 text-slate-400 font-normal">(required for rejection or needs info)</span>
        </label>
        <textarea
          id="review_notes"
          name="review_notes"
          rows={4}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm resize-none focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        {!state.success && state.errors?.review_notes && (
          <p className="mt-1 text-xs text-red-600">{state.errors.review_notes[0]}</p>
        )}
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