// types/roles.ts 
// UserRole union type and role → dashboard route mapping 
  
export type UserRole = 
  | 'student' 
  | 'staff' 
  | 'clerk' 
  | 'technician' 
  | 'supervisor' 
  | 'admin'; 
  
export type SignupStatus = 'pending' | 'approved' | 'rejected'; 
  
// Maps each role to their default dashboard route 
export const ROLE_DASHBOARD: Record<UserRole, string> = { 
  student:    '/requester', 
  staff:      '/requester', 
  clerk:      '/clerk', 
  technician: '/technician', 
  supervisor: '/supervisor', 
  admin:      '/admin', 
}; 