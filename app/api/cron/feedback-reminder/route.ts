import { createServiceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const auth = req.headers.get('Authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Find requests completed in last 7 days with:
    // - no feedback submitted
    // - no existing 'feedback_requested' notification
    const { data: requests } = await supabase
        .from('requests')
        .select('id, requester_id, title, ticket_number')
        .eq('statuses.status_name', 'completed')
        .gte('actual_completion_date', cutoff)
        .not('id', 'in', `(SELECT request_id FROM feedbacks)`)
        .not('id', 'in', `(SELECT request_id FROM notifications WHERE type = 'feedback_requested')`);

    if (!requests?.length) return NextResponse.json({ sent: 0 });

    for (const r of requests) {
        await supabase.from('notifications').insert({
            user_id: r.requester_id,
            request_id: r.id,
            type: 'feedback_requested',
            subject: `How did we do? – ${r.ticket_number}`,
            message: `Please rate your recent repair experience for "${r.title}".`,
        });
    }

    return NextResponse.json({ sent: requests.length });
}