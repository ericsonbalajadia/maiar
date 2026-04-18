'use client'

import { useState, useEffect } from 'react'
import { logoutUser } from '@/actions/auth.actions'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { getRoleDashboard } from '@/lib/rbac'
import Link from 'next/link'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { createClient } from '@/lib/supabase/client'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────
interface DbUser {
  id: string
  full_name: string
  email: string
  role: string
  department?: string
  phone?: string
}

// ─── Static configs ───────────────────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  student:    'Requester',
  staff:      'Requester',
  clerk:      'Clerk',
  technician: 'Personnel',
  supervisor: 'Supervisor',
  admin:      'Admin',
}

const ROLE_BADGE_COLORS: Record<string, string> = {
  student:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  staff:      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  clerk:      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  technician: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  supervisor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  admin:      'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
]

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const getAvatarGradient = (name: string) =>
  AVATAR_GRADIENTS[(name.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length]

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function HeaderSkeleton() {
  return (
    <header className="header-glass h-14 border-b border-white/20 dark:border-white/5 px-5 flex items-center justify-end gap-3">
      <div className="flex items-center gap-1">
        <div className="w-7 h-7 rounded-lg bg-white/20 dark:bg-white/10 animate-pulse" />
        <div className="w-px h-5 bg-slate-200/50 dark:bg-slate-700/50 mx-1" />
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/20 dark:bg-white/10 animate-pulse" />
          <div className="hidden sm:block space-y-1">
            <div className="h-3 w-24 bg-white/20 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-2 w-16 bg-white/20 dark:bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function Header() {
  const [user, setUser] = useState<DbUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    const fetchUser = async (authId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, department, phone')
        .eq('auth_id', authId)
        .single()
      if (!error && data && isMounted) {
        setUser(data)
      }
      if (isMounted) setLoading(false)
    }

    const handleSession = async (session: Session | null) => {
      if (session?.user) {
        await fetchUser(session.user.id)
      } else {
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    // Initial session
supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
  handleSession(session)
})

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        handleSession(session)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  if (loading) {
    return <HeaderSkeleton />
  }

  if (!user) {
    return (
      <header className="header-glass h-14 border-b border-white/20 dark:border-white/5 px-5 flex items-center justify-end gap-3">
        {/* Minimal placeholder – user not logged in */}
        <div className="flex items-center gap-1">
          <div className="w-7 h-7 rounded-lg bg-white/20 dark:bg-white/10" />
        </div>
      </header>
    )
  }

  const role = user.role ?? ''
  const roleLabel = ROLE_LABELS[role] ?? role
  const roleBadge = ROLE_BADGE_COLORS[role] ?? 'bg-slate-100 text-slate-600'
  const initials = getInitials(user.full_name ?? 'User')
  const avatarGradient = getAvatarGradient(user.full_name ?? 'User')
  const settingsHref = `${getRoleDashboard(role)}/settings`

  return (
    <header className="header-glass h-14 border-b border-white/20 dark:border-white/5 px-5 flex items-center justify-between shrink-0 gap-3 sticky top-0 z-30">
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <NotificationBell />
        <div className="w-px h-5 bg-slate-200/50 dark:bg-slate-700/50 mx-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-150 outline-none group">
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm bg-gradient-to-br', avatarGradient)}>
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[120px]">
                  {user.full_name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={cn('text-[10px] font-semibold px-1.5 py-px rounded-full leading-none', roleBadge)}>
                    {roleLabel}
                  </span>
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-all group-data-[state=open]:rotate-180 duration-200" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 rounded-xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl p-1"
          >
            <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm bg-gradient-to-br', avatarGradient)}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-none">{user.full_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
            <DropdownMenuItem asChild className="rounded-lg gap-2.5 py-2 cursor-pointer text-slate-700 dark:text-slate-200 focus:bg-white/30 dark:focus:bg-white/10 hover:bg-white/30 dark:hover:bg-white/10 transition-colors">
              <Link href={settingsHref} className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-white/20 dark:bg-white/10 flex items-center justify-center">
                  <Settings className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                </div>
                <span className="text-sm font-medium">Profile Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
            <DropdownMenuItem
              className="rounded-lg gap-2.5 py-2 cursor-pointer text-rose-600 dark:text-rose-400 focus:bg-rose-50/50 dark:focus:bg-rose-950/30 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors"
              onSelect={() => logoutUser()}
            >
              <div className="w-6 h-6 rounded-md bg-rose-50/50 dark:bg-rose-950/30 flex items-center justify-center">
                <LogOut className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-medium">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}