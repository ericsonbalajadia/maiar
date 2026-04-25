import { createServiceClient } from '@/lib/supabase/service';
import { UserManagementTable } from '@/components/users/user-management-table';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default async function AdminUsersPage() {
  const supabase = createServiceClient();
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, email, role, signup_status, is_active, created_at, department')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch users', error);
    return <div>Failed to load users</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-slate-500">
        <Link href="/admin" className="hover:text-slate-700 flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5 mx-1" />
        <span className="font-medium text-slate-700">Users</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Link
          href="/admin/users/create"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
        >
          + Create User
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <UserManagementTable users={users ?? []} />
      </div>
    </div>
  );
}