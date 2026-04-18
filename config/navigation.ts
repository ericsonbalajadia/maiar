// config/navigation.ts
import type { Role } from '@/lib/constants/roles'

export interface NavItem {
  label: string
  href: string
  icon: string       // Lucide icon name
  badgeKey?: string  // optional key used by sidebar to look up a dynamic badge count
}

// Navigation items grouped by role
export const NAV_ITEMS: Record<Role, NavItem[]> = {
  student: [
    { label: 'Dashboard',    href: '/requester',              icon: 'LayoutDashboard' },
    { label: 'My Requests',  href: '/requester/requests',     icon: 'ClipboardList'   },
    { label: 'New Request',  href: '/requester/requests/new', icon: 'Plus'            },
    { label: 'Notifications',href: '/requester/notifications',icon: 'Bell'            },
  ],
  staff: [
    { label: 'Dashboard',    href: '/requester',              icon: 'LayoutDashboard' },
    { label: 'My Requests',  href: '/requester/requests',     icon: 'ClipboardList'   },
    { label: 'New Request',  href: '/requester/requests/new', icon: 'Plus'            },
    { label: 'Notifications',href: '/requester/notifications',icon: 'Bell'            },
  ],
  clerk: [
    { label: 'Review Queue', href: '/clerk',                    icon: 'Inbox'         },
    { label: 'All Requests', href: '/clerk/requests',           icon: 'ClipboardList' },
    { label: 'Account Requests', href: '/clerk/account-requests', icon: 'UserPlus'   },
    { label: 'Notifications',href: '/clerk/notifications',      icon: 'Bell'          },
  ],
  technician: [
    { label: 'My Tasks',     href: '/technician',               icon: 'Wrench' },
    { label: 'Notifications',href: '/technician/notifications', icon: 'Bell'   },
  ],
  supervisor: [
    { label: 'Dashboard',    href: '/supervisor',               icon: 'LayoutDashboard' },
    { label: 'Feedback Analytics', href: '/supervisor/analytics/feedback', icon: 'BarChart2' },
    { label: 'Requests',     href: '/supervisor/requests',      icon: 'ClipboardList'   },
    { label: 'Notifications',href: '/supervisor/notifications', icon: 'Bell'            },
    { label: 'Staff Requests', href: '/supervisor/account-requests', icon: 'UserCheck'      },
  ],
  admin: [
    { label: 'Dashboard',         href: '/admin',                icon: 'LayoutDashboard' },
    { label: 'Users',             href: '/admin/users',          icon: 'Users'           },
    { label: 'Pending Approvals', href: '/admin/users/pending',  icon: 'UserCheck', badgeKey: 'pendingApprovals' },
    { label: 'All Requests',      href: '/admin/requests',       icon: 'ClipboardList'   },
    { label: 'Settings',          href: '/admin/settings',       icon: 'Settings'        },
    { label: 'Feedback',          href: '/admin/analytics/feedback', icon: 'BarChart2'   },  // only one analytics link
    { label: 'Reports', href: '/admin/analytics/reports', icon: 'BarChart2' }
    // Future: { label: 'Reports', href: '/admin/analytics/reports', icon: 'PieChart' }
],
}