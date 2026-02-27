'use client'

import { useAuth } from './use.auth'
import { ROLES } from '@/lib/constants/roles'

export function useUserRole() {
  const { dbUser, loading } = useAuth()
  const role = dbUser?.role

  return {
    role,
    loading,
    isStudent: role === ROLES.STUDENT,
    isStaff: role === ROLES.STAFF,
    isRequester: role === ROLES.STUDENT || role === ROLES.STAFF,
    isClerk: role === ROLES.CLERK,
    isTechnician: role === ROLES.TECHNICIAN,
    isSupervisor: role === ROLES.SUPERVISOR,
    isAdmin: role === ROLES.ADMIN,
    isApproved: dbUser?.signup_status === 'approved',
  }
}