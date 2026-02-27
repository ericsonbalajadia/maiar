// types/models.ts
// Application-level type aliases — wraps generated database.types.ts 
  
import type { Database } from './database.types'; 
  
export type DbUser = Database['public']['Tables']['users']['Row']; 
export type InsertUser = Database['public']['Tables']['users']['Insert']; 
export type UpdateUser = Database['public']['Tables']['users']['Update']; 
  
// Convenience: user without sensitive fields 
export type PublicUser = Omit<DbUser, 'auth_id'>; 
  
// Type for current logged-in user enriched with auth session 
export type AuthUser = DbUser & { 
  email: string; 
}; 