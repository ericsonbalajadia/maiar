-- Migration: fix_rls_requests_recursion
-- Branch: fix/rls-requests-recursion
-- Fixes: 42P17 infinite recursion on INSERT to public.requests

-- ── 1. Helper function ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TABLE (role TEXT, signup_status TEXT, user_id UUID)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.role::TEXT, u.signup_status::TEXT, u.id
  FROM public.users u
  WHERE u.auth_id = auth.uid() AND u.is_active = TRUE
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

-- ── 2. Drop old policies ─────────────────────────────────────────
DROP POLICY IF EXISTS "Requesters view own requests" ON public.requests;
DROP POLICY IF EXISTS "Technicians view assigned requests" ON public.requests;
DROP POLICY IF EXISTS "Staff view all requests" ON public.requests;
DROP POLICY IF EXISTS "Users create requests" ON public.requests;
DROP POLICY IF EXISTS "Staff update requests" ON public.requests;
DROP POLICY IF EXISTS "Technicians update assigned requests" ON public.requests;
DROP POLICY IF EXISTS "Admins delete requests" ON public.requests;

-- ── 3. New policies ──────────────────────────────────────────────
-- SELECT: own requests
CREATE POLICY "requests_select_requester" ON public.requests FOR SELECT
  USING (requester_id = (SELECT user_id FROM public.get_my_role()));

-- SELECT: assigned technician (direct column)
CREATE POLICY "requests_select_technician" ON public.requests FOR SELECT
  USING (assigned_technician_id = (SELECT user_id FROM public.get_my_role()));

-- SELECT: assignment-table lookup (safe, no back-reference)
CREATE POLICY "requests_select_technician_via_assignment" ON public.requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.request_assignments ra
      WHERE ra.request_id = requests.id
        AND ra.assigned_user_id = (SELECT user_id FROM public.get_my_role())
        AND ra.completed_at IS NULL
    )
  );

-- SELECT: staff
CREATE POLICY "requests_select_staff" ON public.requests FOR SELECT
  USING (
    (SELECT role FROM public.get_my_role()) IN ('clerk','supervisor','admin')
    AND (SELECT signup_status FROM public.get_my_role()) = 'approved'
  );

-- INSERT: approved student/staff only
CREATE POLICY "requests_insert_requester" ON public.requests FOR INSERT
  WITH CHECK (
    requester_id = (SELECT user_id FROM public.get_my_role())
    AND (SELECT role FROM public.get_my_role()) IN ('student','staff')
    AND (SELECT signup_status FROM public.get_my_role()) = 'approved'
  );

-- UPDATE: staff
CREATE POLICY "requests_update_staff" ON public.requests FOR UPDATE
  USING (
    (SELECT role FROM public.get_my_role()) IN ('clerk','supervisor','admin')
    AND (SELECT signup_status FROM public.get_my_role()) = 'approved'
  )
  WITH CHECK (
    (SELECT role FROM public.get_my_role()) IN ('clerk','supervisor','admin')
    AND (SELECT signup_status FROM public.get_my_role()) = 'approved'
  );

-- UPDATE: assigned technician
CREATE POLICY "requests_update_technician" ON public.requests FOR UPDATE
  USING (assigned_technician_id = (SELECT user_id FROM public.get_my_role()))
  WITH CHECK (assigned_technician_id = (SELECT user_id FROM public.get_my_role()));

-- DELETE: admin
CREATE POLICY "requests_delete_admin" ON public.requests FOR DELETE
  USING (
    (SELECT role FROM public.get_my_role()) = 'admin'
    AND (SELECT signup_status FROM public.get_my_role()) = 'approved'
  );

-- ── 4. Simplify CHECK constraint ──────────────────────────────────
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS valid_completion_dates;
ALTER TABLE public.requests ADD CONSTRAINT valid_completion_dates CHECK (
  (estimated_completion_date IS NULL OR estimated_completion_date >= created_at)
  AND (actual_completion_date IS NULL OR actual_completion_date >= created_at)
  AND (actual_completion_date IS NULL OR estimated_completion_date IS NULL
       OR actual_completion_date >= estimated_completion_date)
);







SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE qual::text LIKE '%requests%' OR with_check::text LIKE '%requests%';

SELECT policyname, with_check
FROM pg_policies
WHERE tablename = 'requests' AND cmd = 'INSERT';


SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgrelid = 'public.requests'::regclass;

SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'requests'
ORDER BY cmd, policyname;

-----------------------------

-- Check policies on request_assignments that reference requests
SELECT policyname, qual, with_check
FROM pg_policies
WHERE tablename = 'request_assignments' 
  AND (qual::text LIKE '%requests%' OR with_check::text LIKE '%requests%');

-- List all policies on request_assignments
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'request_assignments'
ORDER BY cmd;

-------------------------------

DROP POLICY IF EXISTS "Requesters view assignments for own requests" ON request_assignments;
DROP POLICY IF EXISTS "Supervisors and admins manage assignments" ON request_assignments;

-- Staff (supervisors/admins) manage assignments
CREATE POLICY "request_assignments_manage_staff" ON request_assignments
  FOR ALL
  USING (
    (SELECT role FROM get_my_role()) IN ('supervisor', 'admin')
    AND (SELECT signup_status FROM get_my_role()) = 'approved'
  );

-- Requesters can view assignments for their own requests (safe subquery using get_my_role)
CREATE POLICY "request_assignments_select_requester" ON request_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = request_assignments.request_id
        AND r.requester_id = (SELECT user_id FROM get_my_role())
    )
  );

DROP POLICY IF EXISTS "requests_select_technician_via_assignment" ON requests;