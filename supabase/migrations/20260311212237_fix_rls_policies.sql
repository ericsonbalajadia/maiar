    -- supabase/migrations/20260311212237_fix_rls_policies.sql

    DROP POLICY IF EXISTS "Staff view active users" ON public.users;
    DROP POLICY IF EXISTS "Admins manage users" ON public.users;

    CREATE POLICY "Staff view active users" ON public.users
    FOR SELECT USING (
        EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = auth.uid()
            AND u.role IN ('clerk', 'technician', 'supervisor', 'admin')
            AND u.signup_status = 'approved'
            AND u.is_active = TRUE
        )
        AND is_active = TRUE
    );

    CREATE POLICY "Admins manage users" ON public.users
    FOR ALL USING (
        EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = auth.uid()
            AND u.role = 'admin'
            AND u.signup_status = 'approved'
        )
    );