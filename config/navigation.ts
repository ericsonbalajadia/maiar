// config/navigation.ts
import type { Role } from '@/lib/constants/roles'

export interface NavItem {
  label: string
  href: string
  icon: string // Lucide icon name
}

// Navigation items grouped by role
export const NAV_ITEMS: Record<Role, NavItem[]> = {
  student: [
    { label: 'Dashboard', href: '/requester', icon: 'LayoutDashboard' },
    { label: 'My Requests', href: '/requester/requests', icon: 'ClipboardList' },
    { label: 'New Request', href: '/requester/new', icon: 'Plus' },
    { label: 'Notifications', href: '/requester/notifications', icon: 'Bell' },
  ],
  staff: [
    { label: 'Dashboard', href: '/requester', icon: 'LayoutDashboard' },
    { label: 'My Requests', href: '/requester/requests', icon: 'ClipboardList' },
    { label: 'New Request', href: '/requester/new', icon: 'Plus' },
    { label: 'Notifications', href: '/requester/notifications', icon: 'Bell' },
  ],
  clerk: [
    { label: 'Review Queue', href: '/clerk', icon: 'Inbox' },
    { label: 'All Requests', href: '/clerk/requests', icon: 'ClipboardList' },
    { label: 'Notifications', href: '/clerk/notifications', icon: 'Bell' },
  ],
  technician: [
    { label: 'My Tasks', href: '/technician', icon: 'Wrench' },
    { label: 'Notifications', href: '/technician/notifications', icon: 'Bell' },
  ],
  supervisor: [
    { label: 'Dashboard', href: '/supervisor', icon: 'LayoutDashboard' },
    { label: 'Requests', href: '/supervisor/requests', icon: 'ClipboardList' },
    { label: 'Notifications', href: '/supervisor/notifications', icon: 'Bell' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    { label: 'Users', href: '/admin/users', icon: 'Users' },
    { label: 'Pending Approvals', href: '/admin/users/pending', icon: 'UserCheck' },
    { label: 'All Requests', href: '/admin/requests', icon: 'ClipboardList' },
    { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
    { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart2' },
  ],
}