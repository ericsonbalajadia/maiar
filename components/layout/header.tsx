'use client'

import { useAuth } from '@/hooks/use.auth'
import { logoutUser } from '@/actions/auth.actions'
import { Bell, ChevronDown, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const ROLE_LABELS: Record<string, string> = {
  student:    'Requester',
  staff:      'Requester',
  clerk:      'Clerk',
  technician: 'Personnel',
  supervisor: 'Supervisor',
  admin:      'Admin',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-amber-500', 'bg-indigo-500',
  ]
  return colors[(name.charCodeAt(0) ?? 0) % colors.length]
}

export function Header() {
  const { dbUser } = useAuth()
  const role = dbUser?.role ?? ''
  const roleLabel = ROLE_LABELS[role] ?? role
  const initials = dbUser?.full_name ? getInitials(dbUser.full_name) : '?'
  const avatarColor = dbUser?.full_name ? getAvatarColor(dbUser.full_name) : 'bg-slate-400'

  const settingsHref = `/${['student', 'staff'].includes(role) ? 'requester' : role}/settings`

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 flex items-center justify-end shrink-0 gap-3">

      {/* Notification bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950" />
      </Button>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0',
              avatarColor
            )}>
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none">
                {dbUser?.full_name ?? '—'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-none mt-0.5 capitalize">
                {roleLabel}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal pb-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
              {dbUser?.full_name}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {dbUser?.email}
            </p>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href={settingsHref} className="flex items-center gap-2 cursor-pointer">
              <Settings className="h-4 w-4 text-slate-400" />
              Profile Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <form action={logoutUser} className="w-full">
              <button type="submit" className="flex w-full items-center gap-2 text-rose-600 dark:text-rose-400">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </header>
  )
}