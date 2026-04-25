'use client';

import Link from 'next/link';
import { updateUserRole, toggleUserActive } from '@/actions/user.actions';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  signup_status: string;
  is_active: boolean;
  department: string | null;
  created_at: string;
}

export function UserManagementTable({ users }: { users: User[] }) {
  const [pendingRole, startRoleTransition] = useTransition();
  const [pendingActive, startActiveTransition] = useTransition();

  const roles = ['student', 'staff', 'clerk', 'technician', 'supervisor', 'admin'];

  const handleRoleChange = (userId: string, newRole: string) => {
    startRoleTransition(async () => {
      await updateUserRole(userId, newRole);
    });
  };

  const handleToggleActive = (userId: string, currentActive: boolean) => {
    startActiveTransition(async () => {
      await toggleUserActive(userId, !currentActive);
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            {['Name', 'Email', 'Role', 'Department', 'Status', 'Active', 'Actions'].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 font-medium">{user.full_name}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
              <td className="px-4 py-3">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={pendingRole}
                  className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-800"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {pendingRole && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
              </td>
              <td className="px-4 py-3">{user.department || '—'}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.signup_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {user.signup_status}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleToggleActive(user.id, user.is_active)}
                  disabled={pendingActive}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    user.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {user.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/users/${user.id}`} className="text-blue-600 hover:underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}