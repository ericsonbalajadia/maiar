// Must exactly match the CHECK constraint in the database:
// role IN ('student','staff','clerk','technician','supervisor','admin')
export const ROLES = {
  STUDENT: 'student',
  STAFF: 'staff',
  CLERK: 'clerk',
  TECHNICIAN: 'technician',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// Signup statuses – matches CHECK constraint in users table
export const SIGNUP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export type SignupStatus = typeof SIGNUP_STATUS[keyof typeof SIGNUP_STATUS]

// Roles that can submit requests (students and staff)
export const REQUESTER_ROLES: Role[] = [ROLES.STUDENT, ROLES.STAFF]

// Roles that have staff‑level access (clerks, technicians, supervisors, admins)
export const STAFF_ROLES: Role[] = [
  ROLES.CLERK,
  ROLES.TECHNICIAN,
  ROLES.SUPERVISOR,
  ROLES.ADMIN,
]