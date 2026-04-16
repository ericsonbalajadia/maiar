import { createAdminClient } from '@/lib/supabase/admin';

type AccountNotificationEvent = 'account_request_submitted' | 'account_approved' | 'account_rejected';

type NotifyAccountParams = {
  userId: string;
  event: AccountNotificationEvent;
  rejectionReason?: string;
};

type AccountEmailContext = {
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  createdAt: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    student: 'Student',
    staff: 'Staff',
    clerk: 'Clerk',
    technician: 'Technician',
    supervisor: 'Supervisor',
    admin: 'Administrator',
  };
  return labels[role] || role.charAt(0).toUpperCase() + role.slice(1);
}

function buildEventContent(event: AccountNotificationEvent, rejectionReason?: string) {
  switch (event) {
    case 'account_request_submitted':
      return {
        subject: 'Account Request Received - iTrack',
        message: 'Your account request has been received and is now pending review. We will notify you once a decision has been made.',
      };
    case 'account_approved':
      return {
        subject: 'Account Approved - iTrack',
        message: 'Congratulations! Your account request has been approved. You can now log in to the iTrack system with your credentials.',
      };
    case 'account_rejected':
      return {
        subject: 'Account Request Status - iTrack',
        message: `Your account request has been declined.${rejectionReason ? ` Reason: ${rejectionReason}` : ''} Please contact the administration for more information.`,
      };
    default:
      return {
        subject: 'Account Status Update - iTrack',
        message: 'Your account status has been updated.',
      };
  }
}

function buildEmailHtml(ctx: AccountEmailContext, mainMessage: string): string {
  const safeName = escapeHtml(ctx.userName);
  const safeMessage = escapeHtml(mainMessage);
  const safeRole = escapeHtml(toRoleLabel(ctx.userRole));

  return [
    `<p>Dear ${safeName},</p>`,
    `<p>${safeMessage}</p>`,
    '<p><strong>Account Details:</strong></p>',
    '<ul>',
    `<li><strong>Email:</strong> ${escapeHtml(ctx.userEmail)}</li>`,
    `<li><strong>Role:</strong> ${safeRole}</li>`,
    `<li><strong>Registration Date:</strong> ${new Date(ctx.createdAt).toLocaleDateString()}</li>`,
    '</ul>',
    '<p>If you have any questions, please contact the administration.</p>',
    '<p>Best regards,<br/>iTrack System Administration</p>',
    '<hr/>',
    '<p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply to this email.</p>',
  ].join('');
}

async function sendEmailDirect(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('notifyAccountByEmail: RESEND_API_KEY is not configured.');
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'iTrack System <noreply@itrack-vsu.edu.ph>';

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

async function getAccountEmailContext(userId: string): Promise<AccountEmailContext | null> {
  const admin = createAdminClient();

  const { data: userRow, error } = await admin
    .from('users')
    .select('id, email, full_name, role, created_at')
    .eq('id', userId)
    .single();

  if (error || !userRow) {
    console.error('notifyAccountByEmail: user fetch failed', {
      userId,
      error: error?.message,
    });
    return null;
  }

  if (!userRow.email) return null;

  return {
    userId: userRow.id,
    userEmail: userRow.email,
    userName: userRow.full_name || 'User',
    userRole: userRow.role || 'user',
    createdAt: userRow.created_at,
  };
}

export async function notifyAccountByEmail({
  userId,
  event,
  rejectionReason,
}: NotifyAccountParams): Promise<void> {
  const context = await getAccountEmailContext(userId);

  if (!context) return;

  const { subject, message } = buildEventContent(event, rejectionReason);
  const htmlBody = buildEmailHtml(context, message);

  try {
    await sendEmailDirect({
      to: context.userEmail,
      subject,
      html: htmlBody,
    });
  } catch (emailError) {
    console.error('notifyAccountByEmail: email send failed', {
      userId,
      event,
      error: emailError,
    });
  }
}
