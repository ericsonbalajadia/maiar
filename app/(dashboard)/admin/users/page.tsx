import { createServiceClient } from '@/lib/supabase/service';
import { UserManagementTable } from '@/components/users/user-management-table';
import Link from 'next/link';
import { ChevronRight, Home, Plus } from 'lucide-react';

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
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-white/[0.08]"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-white/[0.04] overflow-hidden">
        <UserManagementTable users={users ?? []} />
      </div>
    </div>
  );
}
