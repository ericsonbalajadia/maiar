import { createServiceClient } from '@/lib/supabase/service';

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

export default async function FeedbackAnalyticsPage() {
    const supabase = createServiceClient();

    // Fetch feedbacks with comments and request info
    const { data: feedbacksRaw } = await supabase
        .from('feedbacks')
        .select(`
            service_satisfaction,
            overall_rating,
            comments,
            submitted_at,
            is_anonymous,
            request:requests (
                ticket_number,
                id
            )
        `)
        .order('submitted_at', { ascending: false })
        .limit(100);

    // Transform: Supabase returns request as array, extract first element
    const feedbacks = (feedbacksRaw ?? []).map((f: any) => ({
        ...f,
        request: f.request?.[0] ?? null,
    }));

    const total = feedbacks.length;

    // ---- Service Satisfaction stats ----
    const serviceAvg = total
        ? (feedbacks.reduce((s: number, f: any) => s + f.service_satisfaction, 0) / total).toFixed(2)
        : 'N/A';
    const serviceDistribution = [5,4,3,2,1].map(star => ({
        star,
        label: serviceLabels[star],
        count: feedbacks.filter((f: any) => f.service_satisfaction === star).length,
    }));

    // ---- Overall Rating stats ----
    const overallAvg = total
        ? (feedbacks.reduce((s: number, f: any) => s + f.overall_rating, 0) / total).toFixed(2)
        : 'N/A';
    const overallDistribution = [5,4,3,2,1].map(star => ({
        star,
        label: overallLabels[star],
        count: feedbacks.filter((f: any) => f.overall_rating === star).length,
    }));

    // Per‑category overall average
    const { data: byCategory } = await supabase.rpc('get_avg_rating_by_category');

    // Filter comments that are not empty
    const commentsWithText = feedbacks.filter((f: any) => f.comments && f.comments.trim() !== '');

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-bold">Feedback Analytics</h1>

            {/* Service Satisfaction Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-teal-700">Service Satisfaction</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-gray-500">Average Service Satisfaction</p>
                        <p className="text-4xl font-bold text-blue-700">{serviceAvg} ⭐</p>
                        <p className="text-sm text-gray-400">{total} total reviews</p>
                    </div>
                    <div className="rounded-lg border p-4 space-y-2">
                        <p className="text-sm font-medium mb-2">Rating Distribution</p>
                        {serviceDistribution.map(d => (
                            <div key={d.star} className="flex items-center gap-2 text-sm">
                                <span className="w-32">{d.star} – {d.label}</span>
                                <div className="flex-1 bg-gray-100 rounded h-4">
                                    <div className="bg-teal-500 h-4 rounded" style={{ width: `${total ? (d.count / total) * 100 : 0}%` }} />
                                </div>
                                <span className="w-8 text-right">{d.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Overall Rating Section */}
            <section className="space-y-4 pt-4 border-t">
                <h2 className="text-xl font-semibold text-amber-700">Overall Rating</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-gray-500">Average Overall Rating</p>
                        <p className="text-4xl font-bold text-blue-700">{overallAvg} ⭐</p>
                        <p className="text-sm text-gray-400">{total} total reviews</p>
                    </div>
                    <div className="rounded-lg border p-4 space-y-2">
                        <p className="text-sm font-medium mb-2">Rating Distribution</p>
                        {overallDistribution.map(d => (
                            <div key={d.star} className="flex items-center gap-2 text-sm">
                                <span className="w-32">{d.star} – {d.label}</span>
                                <div className="flex-1 bg-gray-100 rounded h-4">
                                    <div className="bg-amber-500 h-4 rounded" style={{ width: `${total ? (d.count / total) * 100 : 0}%` }} />
                                </div>
                                <span className="w-8 text-right">{d.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Per‑category average (Overall only) */}
            {byCategory && byCategory.length > 0 && (
                <section className="pt-4 border-t">
                    <h2 className="text-lg font-semibold mb-3">Average Overall Rating by Category</h2>
                    <div className="rounded-lg border p-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-1">Category</th>
                                    <th className="text-left py-1">Avg Rating</th>
                                    <th className="text-left py-1">Reviews</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(byCategory as any[]).map(row => (
                                    <tr key={row.category_name} className="border-b">
                                        <td className="py-1">{row.category_name}</td>
                                        <td className="py-1">{row.avg_rating} ★</td>
                                        <td className="py-1">{row.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Comments Section */}
            <section className="pt-4 border-t">
                <h2 className="text-lg font-semibold mb-3">Recent Comments & Suggestions</h2>
                {commentsWithText.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No comments submitted yet.</p>
                ) : (
                    <div className="space-y-3">
                        {commentsWithText.map((f: any, idx: number) => (
                            <div key={idx} className="rounded-lg border p-4 bg-white dark:bg-slate-900">
                                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="font-mono">
                                            <a href={`/admin/requests/${f.request?.id}`} className="text-blue-600 hover:underline">
                                                {f.request?.ticket_number}
                                            </a>
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(f.submitted_at).toLocaleDateString('en-PH')}</span>
                                        {f.is_anonymous && <span className="text-amber-600">(anonymous)</span>}
                                    </div>
                                    <div className="flex gap-3 text-xs">
                                        <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                                            Service: {serviceLabels[f.service_satisfaction] || f.service_satisfaction}
                                        </span>
                                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                            Overall: {overallLabels[f.overall_rating] || f.overall_rating}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {f.comments}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}