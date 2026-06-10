// app/(dashboard)/dashboardContent.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Header } from '@/components/layout/header';
import { NotificationProvider } from '@/components/notifications/notification-provider';

export default async function DashboardContent({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: dbUser } = await supabase
    .from('users')
    .select('role, signup_status, full_name, email, id')
    .eq('auth_id', user.id)
    .single();

  if (!dbUser || dbUser.signup_status !== 'approved') {
    redirect('/pending-approval');
  }

  const isRequester = dbUser.role === 'student' || dbUser.role === 'staff';

  return (
    <>
      <div className="hidden md:block">
        <Sidebar userRole={dbUser.role} userName={dbUser.full_name} userEmail={dbUser.email} />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <MobileSidebar userRole={dbUser.role} userName={dbUser.full_name} userEmail={dbUser.email} />
        <Header />
        <main className={isRequester ? "flex-1 overflow-auto py-6 sm:py-7 lg:py-8" : "flex-1 overflow-auto p-6"}>{children}</main>
      </div>
      <NotificationProvider userId={dbUser.id} />
    </>
  );
}
