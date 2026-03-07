import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ROLE_DASHBOARD } from '@/types/roles';

export default async function DashboardContent({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: dbUser } = await supabase
    .from('users')
    .select('role, signup_status, full_name, email')
    .eq('auth_id', user.id)
    .single();

  if (!dbUser || dbUser.signup_status !== 'approved') {
    redirect('/pending-approval');
  }

  return (
    <>
      <Sidebar userRole={dbUser.role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </>
  );
}