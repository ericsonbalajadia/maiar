// app/(dashboard)/admin/users/pending/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UserActionButtons } from './user-action-button';

type PendingUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string | null;
  created_at: string;
};

export default function PendingApprovalsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/pending-users')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUsers(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <p className="text-slate-500">{users.length} users awaiting approval</p>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            No pending users. All registrations have been reviewed.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{user.role}</Badge>
                      {user.department && <Badge variant="secondary">{user.department}</Badge>}
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
  );
}