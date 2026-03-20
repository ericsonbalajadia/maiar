// components/feedback/feedback-form.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitFeedback } from '@/actions/feedback.actions';
import { StarRating } from '@/components/feedback/star-rating';
import { FEATURES } from '@/config/features';
import type { ActionResult } from '@/lib/utils/errors';

const INITIAL: ActionResult = { success: false, errors: {} };

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Sending...' : 'Submit Feedback'}
    </button>
  );
}

export function FeedbackForm({ requestId }: { requestId: string }) {
  if (!FEATURES.FEEDBACK_ENABLED) return null;
  const [state, action] = useFormState(submitFeedback, INITIAL);

  if (state.success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-base font-semibold text-green-800">Thank you for your feedback!</p>
        <p className="mt-1 text-sm text-green-600">Your response has been recorded.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <form action={action} className="space-y-5">
        <input type="hidden" name="request_id" value={requestId} />

        {/* Service satisfaction rating */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Service Satisfaction <span className="text-red-500">*</span>
          </label>
          <StarRating name="service_satisfaction" required />
          {state.errors?.service_satisfaction && (
            <p className="mt-1 text-xs text-red-600">{state.errors.service_satisfaction[0]}</p>
          )}
        </div>

        {/* Overall rating */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <StarRating name="overall_rating" required />
          {state.errors?.overall_rating && (
            <p className="mt-1 text-xs text-red-600">{state.errors.overall_rating[0]}</p>
          )}
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Comments <span className="ml-1 text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            name="comments"
            rows={4}
            placeholder="Tell us about your experience..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm resize-none focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Anonymous toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="is_anonymous"
            value="true"
            className="h-4 w-4 rounded border-slate-300 text-teal-600"
          />
          <span className="text-sm text-slate-600">Submit anonymously</span>
        </label>

        {state.errors?.form && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-xs text-red-700">{state.errors.form[0]}</p>
          </div>
        )}

        <SubmitBtn />
      </form>
    </div>
  );
}