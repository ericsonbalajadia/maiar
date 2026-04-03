export const ROLES = {
    STUDENT: 'student',
    STAFF: 'staff',
    CLERK: 'clerk',
    TECHNICIAN: 'technician',
    SUPERVISOR: 'supervisor',
    ADMIN: 'admin',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]
export type UserRole = Role

export const SIGNUP_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
} as const

export type SignupStatus = typeof SIGNUP_STATUS[keyof typeof SIGNUP_STATUS]

export const REQUESTER_ROLES = [ROLES.STUDENT, ROLES.STAFF] as const
export const STAFF_ROLES = [
    ROLES.CLERK,
    ROLES.TECHNICIAN,
    ROLES.SUPERVISOR,
    ROLES.ADMIN,
] as const

export const CLERK_REVIEW_ROLES = [ROLES.CLERK, ROLES.ADMIN] as const
export const SUPERVISOR_ASSIGNMENT_ROLES = [ROLES.SUPERVISOR, ROLES.ADMIN] as const
export const ACCOMPLISHMENT_RECORD_ROLES = [
    ROLES.TECHNICIAN,
    ROLES.SUPERVISOR,
    ROLES.ADMIN,
] as const

export const APPROVAL_PERMISSIONS: Partial<Record<UserRole, readonly UserRole[]>> = {
    admin: [
        ROLES.STUDENT,
        ROLES.STAFF,
        ROLES.CLERK,
        ROLES.TECHNICIAN,
        ROLES.SUPERVISOR,
    ],
    supervisor: [ROLES.CLERK, ROLES.TECHNICIAN],
    clerk: [ROLES.STUDENT, ROLES.STAFF],
}

export const ROLE_DASHBOARD: Record<UserRole, string> = {
    student: '/requester',
    staff: '/requester',
    clerk: '/clerk',
    technician: '/technician',
    supervisor: '/supervisor',
    admin: '/admin',
}

export function isRole(role: unknown): role is UserRole {
    return typeof role === 'string' && role in ROLE_DASHBOARD
}

export function hasRole(role: unknown, allowed: readonly UserRole[]): boolean {
    return isRole(role) && allowed.includes(role)
}

export function isRequesterRole(role: unknown): role is (typeof REQUESTER_ROLES)[number] {
    return hasRole(role, REQUESTER_ROLES)
}

export function getRoleDashboard(role: unknown): string {
    return isRole(role) ? ROLE_DASHBOARD[role] : '/requester'
}

export function canApproveRole(approverRole: unknown, targetRole: unknown): boolean {
    if (!isRole(approverRole) || !isRole(targetRole)) return false
    const allowed = APPROVAL_PERMISSIONS[approverRole]
    return !!allowed?.includes(targetRole)
}