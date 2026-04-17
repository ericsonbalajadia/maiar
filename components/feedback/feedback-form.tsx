// components/feedback/feedback-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitFeedback } from '@/actions/feedback.actions';
import { StarRating } from '@/components/feedback/star-rating';
import { FEATURES } from '@/config/features';
import type { ActionResult } from '@/lib/utils/errors';

const INITIAL: ActionResult = { success: false, errors: {} };

const serviceLabels: Record<number, string> = {
  1: 'Not Satisfied',
  2: 'Slightly Satisfied',
  3: 'Moderately Satisfied',
  4: 'Very Satisfied',
  5: 'Extremely Satisfied',
};

const overallLabels: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 hover:from-teal-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Sending...' : 'Submit Feedback'}
    </button>
  );
}

export function FeedbackForm({ requestId }: { requestId: string }) {
  if (!FEATURES.FEEDBACK_ENABLED) return null;
  const [state, action] = useActionState(submitFeedback, INITIAL);

  if (state.success) {
    return (
      <div className="rounded-xl backdrop-blur-md bg-white/30 border border-white/40 shadow-xl p-6 text-center">
        <p className="text-base font-semibold text-green-800">Thank you for your feedback!</p>
        <p className="mt-1 text-sm text-green-600">Your response has been recorded.</p>
      </div>
    );
  }

  const handleSubmit = (formData: FormData) => {
    // Always set is_anonymous to false (feedback is never anonymous)
    formData.set('is_anonymous', 'false');
    action(formData);
  };

  return (
    <div className="rounded-2xl backdrop-blur-lg bg-white/20 border border-white/20 shadow-2xl p-6 space-y-5">
      <form action={handleSubmit} className="space-y-5">
        <input type="hidden" name="request_id" value={requestId} />

        {/* Service satisfaction rating */}
        <div>
          <label className="block text-sm text-white font-medium  mb-2">
            Service Satisfaction <span className="text-red-500">*</span>
          </label>
          <StarRating name="service_satisfaction" required labels={serviceLabels} />
          {state.errors?.service_satisfaction && (
            <p className="mt-1 text-xs text-red-600">{state.errors.service_satisfaction[0]}</p>
          )}
        </div>

        {/* Overall rating */}
        <div>
          <label className="block text-sm text-white font-medium  mb-2">
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <StarRating name="overall_rating" required labels={overallLabels} />
          {state.errors?.overall_rating && (
            <p className="mt-1 text-xs text-red-600">{state.errors.overall_rating[0]}</p>
          )}
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm text-white font-medium mb-1">
            Comments <span className="ml-1 text-slate-500 font-normal">(optional)</span>
          </label>
          <textarea
            name="comments"
            rows={4}
            placeholder="Tell us about your experience..."
            className="w-full rounded-xl bg-white/20 backdrop-blur-sm border border-white/50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-500 
                       focus:bg-white/60 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 
                       transition-all duration-200 resize-y"
          />
        </div>

        {state.errors?.form && (
          <div className="rounded-md bg-red-500/20 backdrop-blur-sm border border-red-400/30 p-3">
            <p className="text-xs text-red-800">{state.errors.form[0]}</p>
          </div>
        )}

        <SubmitBtn />
      </form>
    </div>
  );
}