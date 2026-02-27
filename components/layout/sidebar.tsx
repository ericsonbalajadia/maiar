'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/config/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LogOut } from 'lucide-react'
import { logoutUser } from '@/actions/auth.actions'
import * as Icons from 'lucide-react'
import { ComponentType } from 'react'

interface SidebarProps {
  userRole: string
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const navItems = NAV_ITEMS[userRole as keyof typeof NAV_ITEMS] || []

  // Helper to render icon component dynamically
  const renderIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as ComponentType<{ className: string }> | undefined
    return Icon ? <Icon className="h-4 w-4" /> : null
  }

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h1 className="font-bold text-xl text-slate-900 dark:text-white">iTrack</h1>
        <p className="text-xs text-slate-400 mt-0.5">VSU Maintenance</p>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {renderIcon(item.icon)}
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <form action={logoutUser}>
          <Button variant="ghost" className="w-full justify-start gap-3 px-3" size="sm">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  )
}