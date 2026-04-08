    'use server'

    import { createAdminClient } from '@/lib/supabase/admin'
    import { createClient } from '@/lib/supabase/server'
    import { revalidatePath } from 'next/cache'
    import { redirect } from 'next/navigation'

    export async function updateNotificationPreferences(
    formData: FormData
    ): Promise<void> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const admin = createAdminClient()
    const { data: requester } = await admin
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

    if (!requester) return

    const updatePayload = {
        notification_email_status_updates: formData.get('notification_email_status_updates') === 'on',
        notification_email_comments: formData.get('notification_email_comments') === 'on',
        notification_email_assignments: formData.get('notification_email_assignments') === 'on',
        notification_email_system_messages: formData.get('notification_email_system_messages') === 'on',
        notification_channel_email: formData.get('notification_channel_email') === 'on',
        notification_channel_in_app: formData.get('notification_channel_in_app') === 'on',
    }

    const { error } = await admin
        .from('users')
        .update(updatePayload as never)
        .eq('id', requester.id)

    if (error) return

    revalidatePath('/requester/notifications')
    revalidatePath('/requester')
    redirect('/requester/notifications?saved=1')
    }
