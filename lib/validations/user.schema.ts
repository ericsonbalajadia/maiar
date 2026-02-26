// lib/validations/user.schema.ts
import { z } from 'zod'
import { ROLES, SIGNUP_STATUS } from '@/lib/constants/roles'

// Registration form schema – matches handle_new_user() trigger expectations
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  role: z.enum(
    [ROLES.STUDENT, ROLES.STAFF] as const,
    'Please select student or staff'
  ),
  department: z
    .string()
    .max(100, 'Department cannot exceed 100 characters')
    .optional(),
})


// Login form schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

// Admin: update user role/status
export const updateUserSchema = z.object({
  role: z
    .enum([
      ROLES.STUDENT,
      ROLES.STAFF,
      ROLES.CLERK,
      ROLES.TECHNICIAN,
      ROLES.SUPERVISOR,
      ROLES.ADMIN,
    ])
    .optional(),
  signup_status: z
    .enum([SIGNUP_STATUS.PENDING, SIGNUP_STATUS.APPROVED, SIGNUP_STATUS.REJECTED])
    .optional(),
  is_active: z.boolean().optional(),
  department: z
    .string()
    .max(100, 'Department cannot exceed 100 characters')
    .optional(),
})

// Type exports for use in components and actions
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>