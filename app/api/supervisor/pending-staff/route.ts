import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
  noStore();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  
  // Get current user's role to verify they're a supervisor
  const { data: currentUser } = await admin
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single();

  if (!currentUser || currentUser.role !== 'supervisor') {
    return NextResponse.json({ error: 'Only supervisors can view pending staff' }, { status: 403 });
  }

  // Fetch pending clerks and technicians
  const { data, error } = await admin
    .from('users')
    .select('id, email, full_name, role, department, created_at')
    .eq('signup_status', 'pending')
    .in('role', ['clerk', 'technician'])
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
