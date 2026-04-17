//components/feedback/feedback-display.tsx
'use client';

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

interface Props {
  service_satisfaction: number;
  overall_rating: number;
  comments: string | null;
  submitted_at: string;
  is_anonymous?: boolean;
}

export function FeedbackDisplay({
  service_satisfaction,
  overall_rating,
  comments,
  submitted_at,
}: Props) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
      <p className="text-sm font-semibold text-green-900">Your Feedback</p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Service Satisfaction:</span>
          <span className="ml-2 text-gray-900">
            {serviceLabels[service_satisfaction] || service_satisfaction}
          </span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Overall Rating:</span>
          <span className="ml-2 text-gray-900">
            {overallLabels[overall_rating] || overall_rating}
          </span>
        </div>
      </div>
      {comments && <p className="text-sm text-gray-700 italic">"{comments}"</p>}
      <p className="text-xs text-gray-500">
        Submitted {new Date(submitted_at).toLocaleDateString('en-PH')}
      </p>
    </div>
  );
}