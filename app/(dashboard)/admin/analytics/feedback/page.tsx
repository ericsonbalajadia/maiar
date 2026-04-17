import { createServiceClient } from '@/lib/supabase/service';

export default async function FeedbackAnalyticsPage() {
    const supabase = createServiceClient();

    // Overall stats
    const { data: allFeedbacks } = await supabase
        .from('feedbacks')
        .select('overall_rating');

    const total = allFeedbacks?.length ?? 0;
    const avg = total > 0
        ? (allFeedbacks!.reduce((s, f) => s + f.overall_rating, 0) / total).toFixed(2)
        : 'N/A';

    // Rating distribution
    const distribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: allFeedbacks?.filter(f => f.overall_rating === star).length ?? 0,
    }));

    // Per-category average (requires RPC)
    const { data: byCategory } = await supabase.rpc('get_avg_rating_by_category');

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-bold">Feedback Analytics</h1>

            <div className="grid grid-cols-2 gap-6">
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Overall Average Rating</p>
                    <p className="text-4xl font-bold text-blue-700">{avg} ⭐</p>
                    <p className="text-sm text-gray-400">{total} total reviews</p>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                    <p className="text-sm font-medium mb-2">Rating Distribution</p>
                    {distribution.map(d => (
                        <div key={d.star} className="flex items-center gap-2">
                            <span className="w-4 text-sm">{d.star}★</span>
                            <div className="flex-1 bg-gray-100 rounded h-3">
                                <div
                                    className="bg-yellow-400 h-3 rounded"
                                    style={{ width: `${total ? (d.count / total) * 100 : 0}%` }}
                                />
                            </div>
                            <span className="text-xs w-6">{d.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {byCategory && byCategory.length > 0 && (
                <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium mb-3">Average Rating by Category</p>
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
            )}
        </div>
    );
}