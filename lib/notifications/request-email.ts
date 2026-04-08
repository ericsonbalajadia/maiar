import { createAdminClient } from '@/lib/supabase/admin';

type RequestNotificationEvent =
  | 'request_submitted'
  | 'request_approved'
  | 'technician_assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'new_comment'
  | 'schedule_updated'
  | 'feedback_reminder'
  | 'inactivity_notice';

type NotifyRequesterParams = {
  requestId: string;
  event: RequestNotificationEvent;
  actorName?: string;
  reason?: string;
};

type RequestEmailContext = {
  requesterId: string;
  ticketNumber: string;
  title: string;
  requesterName: string;
  requesterEmail: string;
  statusName: string;
  locationText: string;
};

type RequestNotificationPreferences = {
  notification_email_status_updates: boolean;
  notification_email_comments: boolean;
  notification_email_assignments: boolean;
  notification_email_system_messages: boolean;
  notification_channel_email: boolean;
  notification_channel_in_app: boolean;
};

type NotificationTarget = 'status_updates' | 'comments' | 'assignments' | 'system_messages';

const EVENT_TARGETS: Record<RequestNotificationEvent, NotificationTarget> = {
  request_submitted: 'status_updates',
  request_approved: 'status_updates',
  technician_assigned: 'assignments',
  in_progress: 'status_updates',
  completed: 'status_updates',
  cancelled: 'status_updates',
  new_comment: 'comments',
  schedule_updated: 'status_updates',
  feedback_reminder: 'system_messages',
  inactivity_notice: 'system_messages',
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toStatusLabel(statusName: string): string {
  return statusName
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildEventContent(event: RequestNotificationEvent, actorName?: string, reason?: string) {
  switch (event) {
    case 'request_submitted':
      return {
        notificationType: 'request_submitted' as const,
        message: 'Your request has been submitted successfully and is now queued for review.',
      };
    case 'request_approved':
      return {
        notificationType: 'request_approved' as const,
        message: 'Your request has been approved and will be scheduled for assignment.',
      };
    case 'technician_assigned':
      return {
        notificationType: 'status_updated' as const,
        message: actorName
          ? `A technician has been assigned to your request. Assigned technician: ${actorName}.`
          : 'A technician has been assigned to your request.',
      };
    case 'in_progress':
      return {
        notificationType: 'status_updated' as const,
        message: 'Work has started on your request and is currently in progress.',
      };
    case 'completed':
      return {
        notificationType: 'feedback_requested' as const,
        message: 'Work on your request is complete. Please share your feedback when convenient.',
      };
    case 'cancelled':
      return {
        notificationType: 'status_updated' as const,
        message: reason
          ? `Your request has been cancelled. Reason: ${reason}`
          : 'Your request has been cancelled.',
      };
    case 'new_comment':
      return {
        notificationType: 'status_updated' as const,
        message: reason
          ? `A new comment was added to your request: ${reason}`
          : 'A new comment was added to your request.',
      };
    case 'schedule_updated':
      return {
        notificationType: 'status_updated' as const,
        message: reason
          ? `Your request schedule has been updated. ${reason}`
          : 'Your request schedule has been updated.',
      };
    case 'feedback_reminder':
      return {
        notificationType: 'feedback_requested' as const,
        message:
          'Your request has been completed. Please submit your feedback within 30 days if you have not done so yet.',
      };
    case 'inactivity_notice':
      return {
        notificationType: 'status_updated' as const,
        message: 'Your request has been pending for an extended period. Please check for any updates or contact the office if needed.',
      };
    default:
      return {
        notificationType: 'status_updated' as const,
        message: 'Your request status has been updated.',
      };
  }
}

function buildEmailHtml(ctx: RequestEmailContext, mainMessage: string): string {
  const safeName = escapeHtml(ctx.requesterName);
  const safeMainMessage = escapeHtml(mainMessage);
  const safeTicket = escapeHtml(ctx.ticketNumber);
  const safeTitle = escapeHtml(ctx.title);
  const safeStatus = escapeHtml(toStatusLabel(ctx.statusName));
  const safeLocation = escapeHtml(ctx.locationText);

  return [
    `<p>Dear ${safeName},</p>`,
    `<p>${safeMainMessage}</p>`,
    '<p><strong>Request Details:</strong></p>',
    '<ul>',
    `<li><strong>Request ID:</strong> ${safeTicket}</li>`,
    `<li><strong>Title:</strong> ${safeTitle}</li>`,
    `<li><strong>Status:</strong> ${safeStatus}</li>`,
    `<li><strong>Location:</strong> ${safeLocation}</li>`,
    '</ul>',
    '<p>If you have any questions, please contact the General Services Office.</p>',
    '<p>Best regards,<br/>University General Services Office</p>',
    '<hr/>',
    '<p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply to this email.<br/>To manage notification preferences, visit your account settings.</p>',
  ].join('');
}

async function sendEmailDirect(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('notifyRequesterByEmail: RESEND_API_KEY is not configured.');
    return;
  }

  const from =
    process.env.RESEND_FROM_EMAIL ?? 'iTrack System <noreply@itrack-vsu.edu.ph>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Resend request failed (${response.status}): ${payload}`);
  }
}

async function getRequestEmailContext(requestId: string): Promise<RequestEmailContext | null> {
  const admin = createAdminClient();

  const { data: requestRow, error } = await admin
    .from('requests')
    .select(`
      ticket_number,
      title,
      requester:users!requests_requester_id_fkey (
        id,
        full_name,
        email,
        notification_email_status_updates,
        notification_email_comments,
        notification_email_assignments,
        notification_email_system_messages,
        notification_channel_email,
        notification_channel_in_app
      ),
      status:statuses ( status_name ),
      location:locations ( building_name, room_number )
    `)
    .eq('id', requestId)
    .single();

  if (error || !requestRow) {
    console.error('notifyRequesterByEmail: request fetch failed', {
      requestId,
      error: error?.message,
    });
    return null;
  }

  const requester = Array.isArray(requestRow.requester)
    ? requestRow.requester[0]
    : requestRow.requester;
  const status = Array.isArray(requestRow.status) ? requestRow.status[0] : requestRow.status;
  const location = Array.isArray(requestRow.location)
    ? requestRow.location[0]
    : requestRow.location;

  if (!requester?.id || !requester?.email) return null;

  const building = location?.building_name ?? 'N/A';
  const room = location?.room_number ? ` - ${location.room_number}` : '';

  return {
    requesterId: requester.id,
    ticketNumber: requestRow.ticket_number ?? requestId,
    title: requestRow.title ?? 'Untitled request',
    requesterName: requester.full_name ?? 'Requester',
    requesterEmail: requester.email,
    statusName: status?.status_name ?? 'updated',
    locationText: `${building}${room}`,
  };
}

function isEventEnabled(
  event: RequestNotificationEvent,
  preferences: RequestNotificationPreferences,
): boolean {
  if (!preferences.notification_channel_email && !preferences.notification_channel_in_app) {
    return false;
  }

  const target = EVENT_TARGETS[event];
  switch (target) {
    case 'status_updates':
      return preferences.notification_email_status_updates;
    case 'comments':
      return preferences.notification_email_comments;
    case 'assignments':
      return preferences.notification_email_assignments;
    case 'system_messages':
      return preferences.notification_email_system_messages;
    default:
      return true;
  }
}

export async function notifyRequesterByEmail({
  requestId,
  event,
  actorName,
  reason,
}: NotifyRequesterParams): Promise<void> {
  const admin = createAdminClient();
  const context = await getRequestEmailContext(requestId);

  if (!context) return;

  const { data: prefRow } = await admin
    .from('users')
    .select(`
      notification_email_status_updates,
      notification_email_comments,
      notification_email_assignments,
      notification_email_system_messages,
      notification_channel_email,
      notification_channel_in_app
    `)
    .eq('id', context.requesterId)
    .single();

  const preferences = prefRow as unknown as RequestNotificationPreferences | null;
  if (!preferences || !isEventEnabled(event, preferences)) return;

  const { notificationType, message } = buildEventContent(event, actorName, reason);
  const subject = `[Status Update] Request #${context.ticketNumber}`;
  const htmlBody = buildEmailHtml(context, message);

  if (preferences.notification_channel_in_app) {
    const { error: notificationError } = await admin.from('notifications').insert({
      user_id: context.requesterId,
      request_id: requestId,
      type: notificationType,
      subject,
      message,
    });

    if (notificationError) {
      console.error('notifyRequesterByEmail: notification insert failed', {
        requestId,
        error: notificationError.message,
      });
    }
  }

  if (preferences.notification_channel_email) {
    try {
      await sendEmailDirect({
        to: context.requesterEmail,
        subject,
        html: htmlBody,
      });
    } catch (emailError) {
      console.error('notifyRequesterByEmail: direct email send failed', {
        requestId,
        error: emailError,
      });
    }
  }
}
