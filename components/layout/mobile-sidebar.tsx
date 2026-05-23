'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { cn } from '@/lib/utils'

interface MobileSidebarProps {
  userRole: string
  userName?: string
  userEmail?: string
}

export function MobileSidebar({ userRole, userName, userEmail }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const isRequester = userRole === 'student' || userRole === 'staff'

  return (
    <>
      <div
        className={cn(
          'md:hidden flex h-14 shrink-0 items-center justify-between border-b px-4',
          isRequester
            ? 'border-[#6f9873]/60 bg-[#fbfffc] dark:border-white/10 dark:bg-[#101216]'
            : 'border-white/20 bg-white/75 dark:border-white/5 dark:bg-[#101216]'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#6f9873]/60 bg-white/70 dark:border-white/10 dark:bg-white/[0.03]">
            <Image
              src="/itrack-logo.png"
              alt="iTrack"
              width={26}
              height={26}
              className="h-[26px] w-[26px] object-contain"
              priority
            />
          </div>
          <span className="font-heading text-[16px] font-normal leading-none text-slate-900 dark:text-white">
            iTrack
          </span>
        </div>

        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#6f9873]/60 bg-white/70 text-[#0b130b]/70 transition-colors hover:bg-[#ADEBB3]/35 hover:text-[#0b130b] dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/[0.07] dark:hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 cursor-default bg-black/35"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-0 top-0 h-full animate-in slide-in-from-left-4 duration-200">
            <Sidebar
              userRole={userRole}
              userName={userName}
              userEmail={userEmail}
              mobile
              onNavigate={() => setOpen(false)}
            />
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setOpen(false)}
              className="absolute left-[calc(100%+0.5rem)] top-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-white/90 text-[#0b130b]/70 shadow-sm transition-colors hover:bg-white hover:text-[#0b130b] dark:bg-[#101216] dark:text-white/70 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
