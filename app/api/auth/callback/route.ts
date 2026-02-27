import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as string | null
  const next = searchParams.get('next') ?? '/'

  const supabase = await createClient()

  // If we have a code, exchange it for a session (PKCE flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // If we have token_hash and type, verify OTP (email confirmation, etc.)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any, // 'signup', 'email', etc.
      token_hash,
    })
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // If we get here, something went wrong
  return NextResponse.redirect(new URL('/auth/error?error=Unable to confirm email', request.url))
}