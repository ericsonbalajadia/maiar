CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; 

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'student'
        CHECK (role IN ('student', 'staff', 'clerk', 'technician', 'supervisor', 'admin')),
    signup_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (signup_status IN ('pending', 'approved', 'rejected')),
    department VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by UUID REFERENCES public.users(id),
    last_login_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ
);

--indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role_active  ON users(role) WHERE 
is_active = TRUE; 
CREATE INDEX idx_users_role_status ON public.users(role, signup_status);









-- =========== User Table Inspection ============
/*
-- 1. Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Confirm RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 3. List all policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'users';

-- 4. Check triggers on public.users
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 5. Check trigger on auth.users
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' AND event_object_table = 'users';
*/
