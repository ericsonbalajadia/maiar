// actions/notifications/notifications.actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';

export interface NotificationRow {
  id: string;
  user_id: string;
  request_id: string | null;
  type: string;
  subject: string;
  message: string;
  read_at: string | null;           // null = unread
  created_at: string;
  updated_at: string;
  requests?: {
    ticket_number: string;
    title: string;
  } | null;
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const service = createServiceClient();
  const { data } = await service
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  return data?.id ?? null;
}

export async function getNotificationsForPanel(): Promise<{
  data: NotificationRow[] | null;
  error: string | null;
}> {
  const userId = await getCurrentUserId();
  if (!userId) return { data: null, error: 'Unauthenticated' };

  const service = createServiceClient();
  const { data, error } = await service
    .from('notifications')
    .select(`
      id,
      user_id,
      request_id,
      type,
      subject,
      message,
      read_at,
      created_at,
      updated_at,
      requests (
        ticket_number,
        title
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return { data: null, error: error.message };

  // Transform requests array to single object
  const transformed = (data ?? []).map((item: any) => ({
    ...item,
    requests: item.requests?.[0] ?? null,
  }));

  return { data: transformed as NotificationRow[], error: null };
}

export async function getNotificationsPage(page = 1, pageSize = 20): Promise<{
  data: NotificationRow[] | null;
  total: number;
  error: string | null;
}> {
  const userId = await getCurrentUserId();
  if (!userId) return { data: null, total: 0, error: 'Unauthenticated' };

  const service = createServiceClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await service
    .from('notifications')
    .select(`
      id,
      user_id,
      request_id,
      type,
      subject,
      message,
      read_at,
      created_at,
      updated_at,
      requests (
        ticket_number,
        title
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return { data: null, total: 0, error: error.message };

  const transformed = (data ?? []).map((item: any) => ({
    ...item,
    requests: item.requests?.[0] ?? null,
  }));

  return { data: transformed as NotificationRow[], total: count ?? 0, error: null };
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const service = createServiceClient();
  await service
    .from('notifications')
    .update({
      read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .is('read_at', null);   // only unread ones
}

export async function markAllNotificationsRead(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const service = createServiceClient();
  await service
    .from('notifications')
    .update({
      read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .is('read_at', null);

  const roles = ['requester', 'clerk', 'supervisor', 'admin', 'technician'];
  for (const role of roles) {
    revalidatePath(`/${role}/notifications`);
  }
}

export async function getUnreadCount(): Promise<number> {
  const userId = await getCurrentUserId();
  if (!userId) return 0;

  const service = createServiceClient();
  const { count } = await service
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  return count ?? 0;
}

// Get all user IDs for a given role
export async function getUserIdsByRole(role: 'clerk' | 'supervisor' | 'admin'): Promise<string[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('role', role)
    .eq('signup_status', 'approved');
  return data?.map(u => u.id) ?? [];
}

// Send notification to multiple users
export async function sendBulkNotification({
  userIds,
  requestId,
  type,
  subject,
  message,
}: {
  userIds: string[];
  requestId?: string;
  type: string;
  subject: string;
  message: string;
}) {
  if (userIds.length === 0) return;
  const supabase = createServiceClient();
  const notifications = userIds.map(userId => ({
    user_id: userId,
    request_id: requestId || null,
    type,
    subject,
    message,
    read_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  await supabase.from('notifications').insert(notifications);
}