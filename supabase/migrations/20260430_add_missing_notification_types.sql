-- ============================================================
-- FIX: Add missing notification types for account approval/rejection
-- Issue: CHECK constraint doesn't allow account_approved, account_rejected, etc.
-- Solution: Remove restrictive constraint and add unrestricted one
-- ============================================================

-- Step 1: Remove old constraint if it exists
DO $$ 
BEGIN
    -- Try to drop the constraint by finding it dynamically
    ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS "type_check";
    ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS "notifications_type_check";
EXCEPTION WHEN OTHERS THEN
    NULL; -- Continue if constraint doesn't exist
END $$;

-- Step 2: Add new constraint with all required types
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check CHECK (type IN (
    'new_user_registered',
    'account_approved',
    'account_rejected',
    'user_account_approved',
    'user_account_rejected',
    'request_submitted',
    'request_approved',
    'request_rejected',
    'request_needs_info',
    'technician_assigned',
    'status_updated',
    'feedback_requested'
));
