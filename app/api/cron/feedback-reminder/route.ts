import { createServiceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

let completedStatusId: string | null = null;

export async function GET(req: Request) {
    const auth = req.headers.get('Authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Fetch completed status ID once
    if (!completedStatusId) {
        const { data } = await supabase
            .from('statuses')
            .select('id')
            .eq('status_name', 'completed')
            .single();
        completedStatusId = data?.id ?? null;
        if (!completedStatusId) {
            return NextResponse.json({ error: 'Completed status not found' }, { status: 500 });
        }
    }

    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get all completed requests within date window
    const { data: eligibleByStatus, error } = await supabase
        .from('requests')
        .select('id, requester_id, title, ticket_number')
        .eq('status_id', completedStatusId)
        .gte('actual_completion_date', cutoff);

    if (error) {
        console.error('Cron error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!eligibleByStatus?.length) return NextResponse.json({ sent: 0 });

    // Get IDs of requests that already have feedback
    const { data: feedbacks } = await supabase
        .from('feedbacks')
        .select('request_id');
    const feedbackRequestIds = new Set(feedbacks?.map(f => f.request_id) || []);

    // Get IDs of requests that already received a reminder notification
    const { data: notified } = await supabase
        .from('notifications')
        .select('request_id')
        .eq('type', 'feedback_requested');
    const notifiedRequestIds = new Set(notified?.map(n => n.request_id) || []);

    // Filter out requests that already have feedback or a reminder
    const requests = eligibleByStatus.filter(r =>
        !feedbackRequestIds.has(r.id) && !notifiedRequestIds.has(r.id)
    );

    if (requests.length === 0) return NextResponse.json({ sent: 0 });

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