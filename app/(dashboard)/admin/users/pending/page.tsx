// app/(dashboard)/admin/users/pending/page.tsx
import { createAdminClient } from '@/lib/supabase/admin' // ← use admin client
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { UserActionButtons } from './user-action-button'

export default async function PendingApprovalsPage() {
  const admin = createAdminClient() // bypasses RLS

  const { data: pendingUsers, error } = await admin
    .from('users')
    .select('id, email, full_name, role, department, created_at')
    .eq('signup_status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching pending users:', error)
    return <div>Error loading pending users</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <p className="text-slate-500">
          {pendingUsers?.length || 0} users awaiting approval
        </p>
      </div>

      {!pendingUsers?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            No pending users. All registrations have been reviewed.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{user.role}</Badge>
                      {user.department && (
                        <Badge variant="secondary">{user.department}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Registered: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <UserActionButtons userId={user.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}