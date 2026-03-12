// types/models.ts
// Application-level type aliases — wraps generated database.types.ts 
  
import type { Database } from './database.types'; 

// ─────────────────────────────────────────────────────────────
// Phase 1 (existing)
export type DbUser = Database['public']['Tables']['users']['Row'];
export type InsertUser = Database['public']['Tables']['users']['Insert'];
export type UpdateUser = Database['public']['Tables']['users']['Update']; 
  
// Convenience: user without sensitive fields 
export type PublicUser = Omit<DbUser, 'auth_id'>; 
  
// Type for current logged-in user enriched with auth session 
export type AuthUser = DbUser & { 
  email: string; 
}; 

// ─────────────────────────────────────────────────────────────
// Phase 2 – add these
export type DbRequest = Database['public']['Tables']['requests']['Row'];
export type InsertRequest = Database['public']['Tables']['requests']['Insert'];
export type UpdateRequest = Database['public']['Tables']['requests']['Update'];

export type DbLocation = Database['public']['Tables']['locations']['Row'];
export type DbCategory = Database['public']['Tables']['categories']['Row'];
export type DbPriority = Database['public']['Tables']['priorities']['Row'];
export type DbStatus = Database['public']['Tables']['statuses']['Row'];
export type DbRmrDetails = Database['public']['Tables']['rmr_details']['Row'];
export type DbPpsrDetails = Database['public']['Tables']['ppsr_details']['Row'];
export type DbAccomplishment = Database['public']['Tables']['accomplishments']['Row'];
export type DbReview = Database['public']['Tables']['request_reviews']['Row'];
export type DbAssignment = Database['public']['Tables']['request_assignments']['Row'];
export type DbFeedback = Database['public']['Tables']['feedbacks']['Row'];
export type DbAttachment = Database['public']['Tables']['attachments']['Row'];
export type DbNotification = Database['public']['Tables']['notifications']['Row'];
export type DbStatusHistory = Database['public']['Tables']['status_history']['Row'];

// ─────────────────────────────────────────────────────────────
// Compound / joined types
export type RequestWithDetails = DbRequest & {
  status: DbStatus;
  priority: DbPriority;
  location: DbLocation;
  category: DbCategory | null;
  requester: Pick<DbUser, 'id' | 'full_name' | 'email' | 'role'>;
  rmr_details: DbRmrDetails | null;
  ppsr_details: DbPpsrDetails | null;
};

export type RequestSummary = Pick<
  DbRequest,
  'id' | 'ticket_number' | 'title' | 'request_type' | 'created_at'
> & {
  status: Pick<DbStatus, 'status_name'>;
  priority: Pick<DbPriority, 'level'>;
};

export type FeedbackTwoRating = Omit<DbFeedback, 'rating'> & {
  service_satisfaction: number;
  overall_rating: number;
};