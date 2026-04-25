'use client';

import Link from 'next/link';
import { toggleUserActive } from '@/actions/user.actions';
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

const roleColorMap: Record<string, string> = {
  student: 'bg-blue-100 text-blue-700',
  staff: 'bg-indigo-100 text-indigo-700',
  clerk: 'bg-amber-100 text-amber-700',
  technician: 'bg-teal-100 text-teal-700',
  supervisor: 'bg-violet-100 text-violet-700',
  admin: 'bg-rose-100 text-rose-700',
};

export function UserManagementTable({ users }: { users: User[] }) {
  const [pendingActive, startActiveTransition] = useTransition();

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
          {users.map((user) => {
            const roleColor = roleColorMap[user.role] || 'bg-slate-100 text-slate-700';
            const isPending = user.signup_status === 'pending';
            return (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium">{user.full_name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">{user.department || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isPending ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}