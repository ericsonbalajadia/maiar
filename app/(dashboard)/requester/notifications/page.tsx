import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateNotificationPreferences } from '@/actions/notification-preferences.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

type SearchParams = {
  saved?: string
}

type NotificationPreferences = {
  notification_email_status_updates: boolean
  notification_email_comments: boolean
  notification_email_assignments: boolean
  notification_email_system_messages: boolean
  notification_channel_email: boolean
  notification_channel_in_app: boolean
}

function PreferenceRow({
  id,
  label,
  description,
  defaultChecked,
}: {
  id: keyof NotificationPreferences
  label: string
  description: string
  defaultChecked: boolean
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <Checkbox id={id} name={id} defaultChecked={defaultChecked} className="mt-0.5" />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor={id} className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {label}
        </Label>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  )
}

export default async function RequesterNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { saved } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dbUser } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      notification_email_status_updates,
      notification_email_comments,
      notification_email_assignments,
      notification_email_system_messages,
      notification_channel_email,
      notification_channel_in_app
    `)
    .eq('auth_id', user.id)
    .single()

  if (!dbUser) redirect('/login')

  const prefs = dbUser as unknown as NotificationPreferences & { full_name: string }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
          Notifications
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          Notification preferences
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Control which request updates you receive by email or in-app. Status updates stay on by default so important request changes are never missed.
        </p>
      </div>

      {saved === '1' && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          Your notification preferences were saved.
        </div>
      )}

      <form action={updateNotificationPreferences} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email preferences</CardTitle>
            <CardDescription>
              Choose which emails you want to receive for your requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <PreferenceRow
              id="notification_email_status_updates"
              label="Request status updates"
              description="Approval, assignment, in-progress, completion, and cancellation updates."
              defaultChecked={prefs.notification_email_status_updates}
            />
            <PreferenceRow
              id="notification_email_comments"
              label="New comments"
              description="Notes and comments added by clerks or personnel."
              defaultChecked={prefs.notification_email_comments}
            />
            <PreferenceRow
              id="notification_email_assignments"
              label="Assignment notifications"
              description="When a technician has been assigned to your request."
              defaultChecked={prefs.notification_email_assignments}
            />
            <PreferenceRow
              id="notification_email_system_messages"
              label="System messages"
              description="Feedback reminders and inactivity notices."
              defaultChecked={prefs.notification_email_system_messages}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification channels</CardTitle>
            <CardDescription>
              Choose where you want notifications delivered.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <PreferenceRow
              id="notification_channel_email"
              label="Email notifications"
              description="Send notifications to your email inbox."
              defaultChecked={prefs.notification_channel_email}
            />
            <PreferenceRow
              id="notification_channel_in_app"
              label="In-app notifications"
              description="Keep notifications inside the dashboard notification inbox."
              defaultChecked={prefs.notification_channel_in_app}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Save preferences</Button>
        </div>
      </form>
    </div>
  )
}
