//components/layout/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/config/navigation'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import * as Icons from 'lucide-react'
import { ComponentType } from 'react'

interface SidebarProps {
  userRole: string
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
  student:    { label: 'Requester',  accent: 'from-blue-500 to-indigo-600',   dot: 'bg-blue-500' },
  staff:      { label: 'Requester',  accent: 'from-blue-500 to-indigo-600',   dot: 'bg-blue-500' },
  clerk:      { label: 'Clerk',      accent: 'from-amber-400 to-orange-500',  dot: 'bg-amber-400' },
  technician: { label: 'Personnel',  accent: 'from-teal-400 to-emerald-600',  dot: 'bg-teal-400' },
  supervisor: { label: 'Supervisor', accent: 'from-violet-500 to-purple-600', dot: 'bg-violet-500' },
  admin:      { label: 'Admin',      accent: 'from-rose-500 to-pink-600',     dot: 'bg-rose-500' },
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const navItems = NAV_ITEMS[userRole as keyof typeof NAV_ITEMS] || []
  const meta = ROLE_META[userRole] ?? { label: userRole, accent: 'from-slate-500 to-slate-700', dot: 'bg-slate-500' }

  const renderIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as ComponentType<{ className: string }> | undefined
    return Icon ? <Icon className="h-4 w-4 shrink-0" /> : null
  }

  const isActive = (href: string) => {
    if (EXACT_MATCH_HREFS.has(href)) return pathname === href
    if (href === '/requester/requests') {
      return pathname === href || (pathname.startsWith(href + '/') && !pathname.startsWith(href + '/new'))
    }
    return pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
  }

  return (
    <div className="sidebar-glass w-64 flex flex-col h-full relative">
      {/* Left accent stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b ${meta.accent} opacity-50`} />

      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-white/20 dark:border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.accent} flex items-center justify-center shadow-md`}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-[15px] text-slate-900 dark:text-white tracking-tight">iTrack</span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">v2.0</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${meta.dot} shadow-sm`} />
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{meta.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                  active
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/20 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {active && (
                  <span className={`absolute inset-0 rounded-xl bg-gradient-to-r ${meta.accent} opacity-95`} aria-hidden />
                )}
                <span className={cn('relative z-10 transition-colors', active ? 'text-white' : 'text-slate-400 dark:text-slate-500')}>
                  {renderIcon(item.icon)}
                </span>
                <span className="relative z-10 truncate flex-1">{item.label}</span>
                {active && <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-white/20 dark:border-white/5 shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium tracking-wide uppercase">VSU · GSO © 2026</p>
        </div>
      </div>
    </div>
  )
}