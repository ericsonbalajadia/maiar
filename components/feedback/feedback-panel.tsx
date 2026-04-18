import { createServiceClient } from '@/lib/supabase/service';
import { StarRating } from './star-rating';

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
  requestId: string;
}

export async function FeedbackPanel({ requestId }: Props) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('feedbacks')
    .select('service_satisfaction, overall_rating, comments, submitted_at, is_anonymous')
    .eq('request_id', requestId)
    .maybeSingle();

  if (!data) {
    return <p className="text-sm text-gray-400 italic">No feedback submitted yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Service Satisfaction:</span>
          <span className="ml-2 text-gray-900">
            {serviceLabels[data.service_satisfaction] || data.service_satisfaction}
          </span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Overall Rating:</span>
          <span className="ml-2 text-gray-900">
            {overallLabels[data.overall_rating] || data.overall_rating}
          </span>
        </div>
      </div>
      {data.comments && <p className="text-sm text-gray-700 italic">"{data.comments}"</p>}
      <p className="text-xs text-gray-400">
        Submitted {new Date(data.submitted_at).toLocaleDateString('en-PH')}
      </p>
      {data.is_anonymous && <p className="text-xs text-amber-600">(submitted anonymously)</p>}
    </div>
  );
}