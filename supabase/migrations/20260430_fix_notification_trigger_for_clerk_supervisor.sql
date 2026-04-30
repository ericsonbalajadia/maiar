-- ============================================================
-- FIX: Update notification trigger to include Clerk and Supervisor
-- Issue: notify_admin_of_new_signup() only notified admins
-- Solution: Include clerk and supervisor roles in the trigger
-- ============================================================

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_new_user_notify_admin ON public.users;
DROP FUNCTION IF EXISTS public.notify_admin_of_new_signup();

-- Create updated function that notifies admin, clerk, and supervisor
CREATE OR REPLACE FUNCTION public.notify_admin_of_new_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, type, subject, message)
    SELECT
        u.id,
        'new_user_registered',
        'New user registration pending approval: ' || NEW.full_name,
        'A new user (' || NEW.full_name || ' - ' || NEW.email || ') has registered as ' || NEW.role || ' and is awaiting approval.'
    FROM public.users u
    WHERE u.role IN ('admin', 'clerk', 'supervisor') 
      AND u.signup_status = 'approved';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger with updated function
CREATE TRIGGER on_new_user_notify_admin
    AFTER INSERT ON public.users
    FOR EACH ROW
    WHEN (NEW.signup_status = 'pending')
    EXECUTE FUNCTION public.notify_admin_of_new_signup();
