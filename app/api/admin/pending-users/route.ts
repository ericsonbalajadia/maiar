import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
  noStore();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json([])
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('users')
    .select('id, email, full_name, role, department, created_at')
    .eq('signup_status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}