import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyRequesterByEmail } from '@/lib/notifications/request-email'

const DAYS_FOR_FEEDBACK_REMINDER = 1
const DAYS_FOR_INACTIVITY_NOTICE = 14

function startOfDayMinus(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const provided = req.headers.get('x-cron-secret')
    if (provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const admin = createAdminClient()
  const results = {
    feedbackReminders: 0,
    inactivityNotices: 0,
    errors: [] as string[],
  }

  const { data: completedStatus } = await admin
    .from('statuses')
    .select('id')
    .eq('status_name', 'completed')
    .single()

  const { data: pendingStatus } = await admin
    .from('statuses')
    .select('id')
    .eq('status_name', 'pending')
    .single()

  if (completedStatus) {
    const { data: completedRequests } = await admin
      .from('requests')
      .select('id, actual_completion_date, created_at')
      .eq('status_id', completedStatus.id)
      .lte('actual_completion_date', startOfDayMinus(DAYS_FOR_FEEDBACK_REMINDER))
      .limit(100)

    for (const request of completedRequests ?? []) {
      const { data: feedbackExists } = await admin
        .from('feedbacks')
        .select('id')
        .eq('request_id', request.id)
        .maybeSingle()

      if (feedbackExists) continue

      const { data: reminderExists } = await admin
        .from('notifications')
        .select('id')
        .eq('request_id', request.id)
        .eq('type', 'feedback_requested')
        .maybeSingle()

      if (reminderExists) continue

      try {
        await notifyRequesterByEmail({
          requestId: request.id,
          event: 'feedback_reminder',
        })
        results.feedbackReminders += 1
      } catch (error) {
        results.errors.push(error instanceof Error ? error.message : 'Feedback reminder failed')
      }
    }
  }

  if (pendingStatus) {
    const { data: pendingRequests } = await admin
      .from('requests')
      .select('id, created_at')
      .eq('status_id', pendingStatus.id)
      .lte('created_at', startOfDayMinus(DAYS_FOR_INACTIVITY_NOTICE))
      .limit(100)

    for (const request of pendingRequests ?? []) {
      const { data: inactivityExists } = await admin
        .from('notifications')
        .select('id')
        .eq('request_id', request.id)
        .eq('type', 'status_updated')
        .maybeSingle()

      if (inactivityExists) continue

      try {
        await notifyRequesterByEmail({
          requestId: request.id,
          event: 'inactivity_notice',
        })
        results.inactivityNotices += 1
      } catch (error) {
        results.errors.push(error instanceof Error ? error.message : 'Inactivity notice failed')
      }
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
