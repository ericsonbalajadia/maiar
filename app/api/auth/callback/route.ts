import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRoleDashboard } from '@/lib/rbac';
import { notifyAccountByEmail } from '@/lib/notifications/account-email';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as string | null;
  const next = searchParams.get('next') ?? '/';
  const error = searchParams.get('error');
  const error_code = searchParams.get('error_code');
  const error_description = searchParams.get('error_description');

  console.log('Callback received:', { code, token_hash, type, next });

  const supabase = await createClient();

  // ---- Handle errors from Supabase (e.g., expired link) ----
  if (error || error_code) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('error', 'verification_failed');
    if (error_description) {
      redirectUrl.searchParams.set('error_description', error_description);
    } else if (error) {
      redirectUrl.searchParams.set('error_description', error);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // 1. Exchange the code or verify OTP
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL('/auth/error?error=exchange_failed', request.url));
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });
    if (error) {
      return NextResponse.redirect(new URL('/auth/error?error=verification_failed', request.url));
    }
  } else {
    return NextResponse.redirect(new URL('/auth/error?error=missing_params', request.url));
  }

  // 2. Get the current user from the session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.redirect(new URL('/auth/error?error=no_user', request.url));
  }

  // 3. Fetch the user's profile from public.users
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('id, role, signup_status')
    .eq('auth_id', user.id)
    .single();

  if (dbError || !dbUser) {
    // If profile doesn't exist, something went wrong – log out and show error
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/auth/error?error=no_profile', request.url));
  }

  // 4. Redirect based on signup_status
  if (dbUser.signup_status === 'approved') {
    return NextResponse.redirect(new URL(getRoleDashboard(dbUser.role), request.url));
  }

  if (dbUser.signup_status === 'pending') {
    // Send pending-approval notice only after verification link callback.
    if ((code || token_hash) && user.email_confirmed_at) {
      try {
        await notifyAccountByEmail({
          userId: dbUser.id,
          event: 'account_pending_approval',
        });
      } catch (notifyError) {
        console.error('auth callback: failed to send pending-approval email', {
          userId: dbUser.id,
          error: notifyError,
        });
      }
    }

    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login?verified=1', request.url));
  }

  if (dbUser.signup_status === 'rejected') {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login?error=account_rejected', request.url));
  }

  // Fallback (should never reach here)
  return NextResponse.redirect(new URL('/', request.url));
}