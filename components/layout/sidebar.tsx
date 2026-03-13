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

// These hrefs only highlight when the pathname matches EXACTLY.
// Prevents parent segments from also lighting up on deep sub-routes.
// e.g. on /requester/requests/new/rmr we want ONLY "New Request" active,
// not "Dashboard" (/requester) or "My Requests" (/requester/requests).
const EXACT_MATCH_HREFS = new Set([
  '/requester',
  '/requester/requests',
  '/requester/requests/new',
  '/admin',
  '/clerk',
  '/technician',
  '/supervisor',
])

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const navItems = NAV_ITEMS[userRole as keyof typeof NAV_ITEMS] || []

  const renderIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as ComponentType<{ className: string }> | undefined
    return Icon ? <Icon className="h-4 w-4 shrink-0" /> : null
  }

  const isActive = (href: string) => {
    // For the New Request route and role root routes: exact match only.
    // This prevents /requester/requests/new/rmr from lighting up both
    // "Dashboard" and "My Requests" alongside "New Request".
    if (href === '/requester/requests/new' ||
        href === '/requester' ||
        href === '/admin' ||
        href === '/clerk' ||
        href === '/technician' ||
        href === '/supervisor') {
      return pathname === href
    }
    // For list/index routes (e.g. My Requests), match exact + direct detail pages
    // but NOT sub-routes under /new
    if (href === '/requester/requests') {
      return pathname === href || (
        pathname.startsWith(href + '/') && !pathname.startsWith(href + '/new')
      )
    }
    return pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
  }

  return (
    <div className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full">

      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white dark:text-slate-900" stroke="currentColor" strokeWidth={2.5}>
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">iTrack</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">v2.0</span>
          </div>
        </div>
      </div>

      {/* ── Nav items ── */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <span className={cn(
                  active ? 'text-white dark:text-slate-900' : 'text-slate-400 dark:text-slate-500'
                )}>
                  {renderIcon(item.icon)}
                </span>
                <span className="truncate flex-1">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* ── Footer ── */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-slate-300 dark:text-slate-700">RMMS © 2026</p>
      </div>
    </div>
  )
}