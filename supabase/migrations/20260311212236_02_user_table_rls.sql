ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 1. Users can view their own profile
CREATE POLICY "Users view own profile" ON public.users
    FOR SELECT USING (auth_id = auth.uid());

-- 2. Staff (clerks, technicians, supervisors, admins) can view all active users
CREATE POLICY "Staff view active users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.auth_id = auth.uid()
            AND u.role IN ('clerk', 'technician', 'supervisor', 'admin')
            AND u.signup_status = 'approved'
        )
        AND is_active = TRUE
    );

-- 3. Users can update their own profile (but not role ΓÇô handled by a trigger)
CREATE POLICY "Users update own profile" ON public.users
    FOR UPDATE USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());

-- 4. Admins can manage all users (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins manage users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- 5. Service role full access (for triggers / background jobs)
CREATE POLICY "Service role full access" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

----------------------------------------------------------------------------------------------

-- Drop the old policy and function
DROP POLICY IF EXISTS "Staff view active users" ON public.users;
DROP FUNCTION IF EXISTS get_current_user_role;

-- Create new policy using JWT claims
CREATE POLICY "Staff view active users" ON public.users
    FOR SELECT USING (
        (auth.jwt() -> 'user_metadata' ->> 'role')::text IN ('clerk', 'technician', 'supervisor', 'admin')
        AND is_active = TRUE
    );


DROP POLICY IF EXISTS "Admins manage users" ON public.users;

CREATE POLICY "Admins manage users" ON public.users
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    );
