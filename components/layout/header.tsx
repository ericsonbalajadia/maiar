// components/layout/header.tsx
'use client'

import { useAuth } from '@/hooks/use.auth'

export function Header() {
  const { dbUser } = useAuth()

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-end">
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {dbUser?.full_name}
        </span>
        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
          {dbUser?.role}
        </span>
      </div>
    </header>
  )
}