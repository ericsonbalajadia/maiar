import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getRoleDashboard, ROLE_DASHBOARD } from '@/lib/rbac'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = [
    '/login',
    '/register',
    '/pending-approval',
    '/forgot-password',
    '/reset-password',
    '/error',
    '/check-email',
    '/api/auth/callback',
]

const PENDING_ALLOWED_ROUTES = [
    '/pending-approval',
    '/api/auth/callback',
]

const DASHBOARD_PREFIXES = [...new Set(Object.values(ROLE_DASHBOARD))]

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const response = NextResponse.next({ request })
    const supabase = createMiddlewareClient(request, response)

    let user = null
    try {
        const {
            data: { user: fetchedUser },
        } = await supabase.auth.getUser()
        user = fetchedUser
    } catch (error) {
        console.error('Middleware auth error:', error)
    }

    const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
    const isDashboard =
        pathname.startsWith('/dashboard') ||
        DASHBOARD_PREFIXES.some((prefix) => pathname.startsWith(prefix))

    if (!user && !isPublic) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user) {
        const { data: dbUser } = await supabase
            .from('users')
            .select('role, signup_status, is_active')
            .eq('auth_id', user.id)
            .single()

        if (!dbUser) {
            return NextResponse.redirect(new URL('/pending-approval', request.url))
        }

        if (!dbUser.is_active || dbUser.signup_status === 'rejected') {
            await supabase.auth.signOut()
            return NextResponse.redirect(new URL('/login?error=account_inactive', request.url))
        }

        if (dbUser.signup_status === 'pending') {
            const allowedForPending = PENDING_ALLOWED_ROUTES.some((route) => pathname.startsWith(route))
            if (!allowedForPending) {
                return NextResponse.redirect(new URL('/pending-approval', request.url))
            }
            return response
        }

        if (['/login', '/register', '/pending-approval'].some((route) => pathname.startsWith(route))) {
            return NextResponse.redirect(new URL(getRoleDashboard(dbUser.role), request.url))
        }

        if (isDashboard) {
            const allowedPrefix = getRoleDashboard(dbUser.role)
            if (!pathname.startsWith(allowedPrefix)) {
                return NextResponse.redirect(new URL(allowedPrefix, request.url))
            }
        }
    }

    return response
}

export default proxy

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico|css|js)$).*)'],
}