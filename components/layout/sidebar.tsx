//components/layout/sidebar.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { logoutUser } from '@/actions/auth.actions'
import { NAV_ITEMS } from '@/config/navigation'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeSwitcher } from '@/components/common/theme-switcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import * as Icons from 'lucide-react'
import { ComponentType } from 'react'

interface SidebarProps {
  userRole: string
  userName?: string
  userEmail?: string
  mobile?: boolean
  onNavigate?: () => void
}

const EXACT_MATCH_HREFS = new Set([
  '/requester',
  '/requester/requests',
  '/requester/requests/new',
  '/admin',
  '/admin/users',
  '/clerk',
  '/clerk/account-requests',
  '/technician',
  '/supervisor',
  '/supervisor/account-requests',
])

const ROLE_META: Record<string, { label: string; accent: string; dot: string }> = {
  student:    { label: 'Requester',  accent: 'from-[#ADEBB3] to-[#ADEBB3]',   dot: 'bg-[#ADEBB3]' },
  staff:      { label: 'Requester',  accent: 'from-[#ADEBB3] to-[#ADEBB3]',   dot: 'bg-[#ADEBB3]' },
  clerk:      { label: 'Clerk',      accent: 'from-amber-400 to-orange-500',  dot: 'bg-amber-400' },
  technician: { label: 'Personnel',  accent: 'from-[#8dc192] to-[#527255]',  dot: 'bg-[#8dc192]' },
  supervisor: { label: 'Supervisor', accent: 'from-violet-500 to-purple-600', dot: 'bg-violet-500' },
  admin:      { label: 'Admin',      accent: 'from-rose-500 to-pink-600',     dot: 'bg-rose-500' },
}

const getInitials = (name: string) =>
  name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2)

export function Sidebar({ userRole, userName = 'User', userEmail = '', mobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const navItems = NAV_ITEMS[userRole as keyof typeof NAV_ITEMS] || []
  const meta = ROLE_META[userRole] ?? { label: userRole, accent: 'from-slate-500 to-slate-700', dot: 'bg-slate-500' }
  const isRequester = userRole === 'student' || userRole === 'staff'

  const renderIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as ComponentType<{ className: string }> | undefined
    return Icon ? <Icon className="h-[15px] w-[15px] shrink-0" /> : null
  }

  const isActive = (href: string) => {
    if (EXACT_MATCH_HREFS.has(href)) return pathname === href
    if (href === '/requester/requests') {
      return pathname === href || (pathname.startsWith(href + '/') && !pathname.startsWith(href + '/new'))
    }
    return pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
  }

  return (
    <div className={cn('sidebar-glass flex flex-col h-full relative', mobile ? 'w-72 max-w-[82vw]' : 'w-64', isRequester && 'bg-[#fbfffc] dark:bg-white/[0.03]')}>
      {/* Left accent stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b ${meta.accent} opacity-50`} />

      {/* Logo */}
      <div className={cn('px-4 py-4 border-b shrink-0', isRequester ? 'border-[#6f9873]/60 dark:border-white/10' : 'border-white/20 dark:border-white/5')}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className={cn('flex shrink-0 items-center justify-center border bg-white/70', isRequester ? 'h-8 w-8 rounded-[10px] border-[#6f9873]/60 dark:border-white/10 dark:bg-white/[0.03]' : 'h-11 w-11 rounded-2xl border-white/20 shadow-md dark:bg-white/[0.04]')}>
              <Image
                src="/itrack-logo.png"
                alt="iTrack"
                width={isRequester ? 26 : 34}
                height={isRequester ? 26 : 34}
                className={cn('object-contain', isRequester ? 'h-[26px] w-[26px]' : 'h-[34px] w-[34px]')}
                priority
              />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-heading text-[16px] font-normal leading-none text-slate-900 dark:text-white">iTrack</span>
              </div>
              {!isRequester && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${meta.dot} shadow-sm`} />
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{meta.label}</span>
                </div>
              )}
            </div>
          </div>
          {isRequester && (
            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-[#6f9873]/60 bg-white/60 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
              <ThemeSwitcher className="h-7 w-7 rounded-md border-0 bg-transparent text-[#0b130b]/60 shadow-none hover:bg-[#ADEBB3]/35 hover:text-[#0b130b] dark:bg-transparent dark:text-white/60 dark:hover:bg-white/[0.07] dark:hover:text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 pt-4 pb-4">
        <nav className={cn(isRequester ? 'space-y-1' : 'space-y-2')}>
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'relative flex items-center gap-3 border transition-colors duration-150 ease-in-out group',
                  isRequester
                    ? cn(
                        'rounded-lg border-transparent px-3 py-2.5 text-[13px] font-normal',
                        active
                          ? 'border-l-[3px] border-l-[#6f9873] bg-[#ADEBB3]/[0.18] pl-[9px] font-medium text-[#0b130b] dark:border-l-[#ADEBB3] dark:bg-white/[0.06] dark:text-white'
                          : 'text-[#0b130b]/65 hover:bg-[#ADEBB3]/35 hover:text-[#0b130b] dark:text-white/60 dark:hover:bg-white/[0.05] dark:hover:text-white'
                      )
                    : cn(
                        'rounded-2xl px-3.5 py-3 text-sm font-medium',
                        active
                          ? 'text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/[0.07] hover:text-[#0b130b] dark:hover:text-white',
                        'border-transparent'
                      )
                )}
              >
                {active && !isRequester && (
                  <span className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${meta.accent} ${isRequester ? 'opacity-0' : 'opacity-95'}`} aria-hidden />
                )}
                <span className={cn('relative z-10 transition-colors', isRequester ? active ? 'text-[#1e2c1f] opacity-100 dark:text-emerald-300' : 'text-[#0b130b]/55 opacity-55 dark:text-white/55' : active ? 'text-white' : 'text-[#527255] dark:text-slate-500 group-hover:text-[#1e2c1f] dark:group-hover:text-emerald-300')}>
                  {renderIcon(item.icon)}
                </span>
                <span className="relative z-10 truncate flex-1">{item.label}</span>
                {active && !isRequester && <span className="relative z-10 w-1.5 h-1.5 rounded-full shrink-0 bg-white/70" />}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className={cn('border-t shrink-0', isRequester ? 'px-4 py-4 border-[#6f9873]/60 dark:border-white/10' : 'px-5 py-4 border-white/20 dark:border-white/5')}>
        {isRequester ? (
          <div className="space-y-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full cursor-pointer rounded-xl border border-[#6f9873]/60 bg-white/60 px-3 py-3 text-left transition-colors duration-150 ease-in-out hover:bg-[#ADEBB3]/35 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#ADEBB3]/50 text-[11px] font-medium text-[#1e2c1f] dark:bg-white/[0.08] dark:text-emerald-300">
                      {getInitials(userName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-[#0b130b] dark:text-white">{userName}</p>
                      <p className="truncate text-[11px] font-normal text-[#0b130b]/45 dark:text-white/45">Requester</p>
                    </div>
                    <Icons.ChevronUp className="h-3.5 w-3.5 text-[#527255]" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                sideOffset={8}
                className="w-56 rounded-xl border border-[#6f9873]/60 bg-white/95 p-1 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#ADEBB3]/35 dark:bg-white/[0.08]" />
                <DropdownMenuItem asChild className="rounded-xl gap-2.5 py-2 cursor-pointer">
                  <Link href="/requester/settings" onClick={onNavigate} className="flex items-center gap-2.5">
                    <Icons.Settings className="h-4 w-4 text-[#6f9873]" />
                    <span className="text-sm font-medium">Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl gap-2.5 py-2 cursor-pointer">
                  <Link href="/requester/notifications/preferences" onClick={onNavigate} className="flex items-center gap-2.5">
                    <Icons.Bell className="h-4 w-4 text-[#6f9873]" />
                    <span className="text-sm font-medium">Notification Preferences</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#ADEBB3]/35 dark:bg-white/[0.08]" />
                <DropdownMenuItem
                  className="rounded-xl gap-2.5 py-2 cursor-pointer text-rose-600 focus:bg-rose-50 dark:text-rose-400 dark:focus:bg-rose-950/30"
                  onSelect={() => logoutUser()}
                >
                  <Icons.LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="pt-1">
              <p className="text-[10px] text-[#527255] dark:text-slate-500 font-medium tracking-wide uppercase">VSU - GSO 2026</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium tracking-wide uppercase">VSU - GSO 2026</p>
          </div>
        )}
      </div>
    </div>
  )
}
