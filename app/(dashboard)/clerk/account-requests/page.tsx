//app/(dashboard)/clerk/account-requests/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RequestActionButtons } from './request-action-buttons';

type PendingRequester = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string | null;
  created_at: string;
};

export default function ClerkAccountRequestsPage() {
  const [users, setUsers] = useState<PendingRequester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/clerk/pending-requesters')
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

  const roleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account Requests</h1>
        <p className="text-slate-500">{users.length} requester(s) awaiting approval</p>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            No pending requests. All requester registrations have been reviewed.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{roleLabel(user.role)}</Badge>
                      {user.department && <Badge variant="secondary">{user.department}</Badge>}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Registered: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <RequestActionButtons 
                    userId={user.id}
                    onSuccess={() => {
                      setUsers(users.filter(u => u.id !== user.id));
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
