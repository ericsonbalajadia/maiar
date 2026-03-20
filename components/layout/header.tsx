'use client'

import { useAuth } from '@/hooks/use.auth'
import { logoutUser } from '@/actions/auth.actions'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
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
import { NotificationBell } from '@/components/notifications/notification-bell'

// 1. Move static configs outside the component to prevent re-renders
const ROLE_LABELS: Record<string, string> = {
  student: 'Requester',
  staff: 'Requester',
  clerk: 'Clerk',
  technician: 'Personnel',
  supervisor: 'Supervisor',
  admin: 'Admin',
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-amber-500', 'bg-indigo-500',
]

// 2. Helper Logic
const getInitials = (name: string) => 
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const getAvatarColor = (name: string) => 
  AVATAR_COLORS[(name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]

export function Header() {
  const { dbUser } = useAuth()
  
  if (!dbUser) return <header className="h-14 border-b bg-white dark:bg-slate-950" />

  const role = dbUser.role ?? ''
  const roleLabel = ROLE_LABELS[role] ?? role
  const initials = getInitials(dbUser.full_name ?? 'User')
  const avatarColor = getAvatarColor(dbUser.full_name ?? 'User')
  
  // Clean path logic
  const dashboardType = ['student', 'staff'].includes(role) ? 'requester' : role
  const settingsHref = `/${dashboardType}/settings`

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 flex items-center justify-end shrink-0 gap-3">
      
      {/* Separated Notification Logic */}
      <NotificationBell />

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none group">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm',
              avatarColor
            )}>
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none">
                {dbUser.full_name}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">
                {roleLabel}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{dbUser.full_name}</p>
              <p className="text-xs leading-none text-muted-foreground">{dbUser.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={settingsHref} className="w-full flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Profile Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/50" 
            onSelect={() => logoutUser()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}