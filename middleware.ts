// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

// Routes that do NOT require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/pending-approval',
  '/forgot-password',
  '/reset-password',
  '/error',
  '/api/auth/callback',
]

const ROLE_ROUTES: Record<string, string> = {
  student: '/requester',
  staff: '/requester',
  clerk: '/clerk',
  technician: '/technician',
  supervisor: '/supervisor',
  admin: '/admin',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })
  const supabase = createMiddlewareClient(request, response)

  // Refresh session – required to keep auth cookies alive
  const { data: { user } } = await supabase.auth.getUser()

  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  const isDashboard = pathname.startsWith('/dashboard') ||
    ['/requester', '/clerk', '/technician', '/supervisor', '/admin'].some(prefix =>
      pathname.startsWith(prefix)
    )

  // 1. Not logged in – redirect to login
  if (!user && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Logged in but on public route – check if should go to dashboard
  if (user && ['/login', '/register'].some(route => pathname.startsWith(route))) {
    // Fetch their status from the DB
    const { data: dbUser } = await supabase
      .from('users')
      .select('role, signup_status, is_active')
      .eq('auth_id', user.id)
      .single()

    if (dbUser?.signup_status === 'approved' && dbUser.is_active) {
      const dest = ROLE_ROUTES[dbUser.role] ?? '/requester'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    // Otherwise stay on public route (pending-approval, etc.)
  }

  // 3. Logged in + accessing dashboard – enforce role routing
  if (user && isDashboard) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('role, signup_status, is_active')
      .eq('auth_id', user.id)
      .single()

    if (!dbUser || dbUser.signup_status === 'pending') {
      return NextResponse.redirect(new URL('/pending-approval', request.url))
    }

    if (!dbUser.is_active || dbUser.signup_status === 'rejected') {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=account_inactive', request.url))
    }

    // Redirect if accessing wrong role section
    const allowedPrefix = ROLE_ROUTES[dbUser.role]
    if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL(allowedPrefix, request.url))
    }
  }

  return response
}

// Match all routes except static files and Next.js internals
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico|css|js)$).*)'],
}