import { getAuthUser } from '@/lib/auth';
import { ROLES } from '@/lib/rbac';
import { CreateUserForm } from '@/components/users/create-user-form';
import Link from 'next/link';
import { ChevronLeft, Home, ChevronRight, UserPlus } from 'lucide-react';

export default async function CreateUserPage() {
  await getAuthUser([ROLES.ADMIN]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-slate-500">
        <Link href="/admin" className="hover:text-slate-700 flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5 mx-1" />
        <Link href="/admin/users" className="hover:text-slate-700">Users</Link>
        <ChevronRight className="h-3.5 w-3.5 mx-1" />
        <span className="font-medium text-slate-700">Create User</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
          <UserPlus className="h-4 w-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New User</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <CreateUserForm />
      </div>
    </div>
  );
}