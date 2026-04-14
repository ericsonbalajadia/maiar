-- ============================================================
-- requests Table
-- Creates the core requests table with request_type discriminator.
-- This Includes ticket_number generation and all indexes.


-- Create the requests table
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE,  -- filled by trigger
    requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    request_type VARCHAR(10) NOT NULL DEFAULT 'rmr' CHECK (request_type IN ('rmr', 'ppsr')),
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
    category_id UUID NULL REFERENCES public.categories(id) ON DELETE RESTRICT,  -- NULL for PPSR
    priority_id UUID NOT NULL REFERENCES public.priorities(id) ON DELETE RESTRICT,
    status_id UUID NOT NULL REFERENCES public.statuses(id) ON DELETE RESTRICT,
    assigned_technician_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
    estimated_completion_date DATE NULL,
    actual_completion_date DATE NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_requests_requester ON public.requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status_id);
CREATE INDEX IF NOT EXISTS idx_requests_type ON public.requests(request_type);
CREATE INDEX IF NOT EXISTS idx_requests_ticket ON public.requests(ticket_number);
CREATE INDEX IF NOT EXISTS idx_requests_created ON public.requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_assigned ON public.requests(assigned_technician_id)
    WHERE assigned_technician_id IS NOT NULL;

-- Triggers
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_number := 'ITR-' ||
        TO_CHAR(NOW(), 'YYYY') || '-' ||
        UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 6));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_ticket_number
    BEFORE INSERT ON public.requests
    FOR EACH ROW
    WHEN (NEW.ticket_number IS NULL)
    EXECUTE FUNCTION public.generate_ticket_number();


CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


-- =============== VERIFICATION ============
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'requests'
ORDER BY ordinal_position;
-- Expected: All columns

SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'requests' AND schemaname = 'public'
ORDER BY indexname;
-- Expected: All Indexes 


SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'requests' AND trigger_schema = 'public';
-- Expected: All triggers

-- Insert a test RMR request
INSERT INTO public.requests (
    requester_id,
    title,
    description,
    location_id,
    priority_id,
    status_id,
    request_type
)
SELECT
    (SELECT id FROM public.users WHERE role IN ('student','staff') LIMIT 1),
    'Verification Test Request',
    'This is a test to verify ticket generation',
    (SELECT id FROM public.locations LIMIT 1),
    (SELECT id FROM public.priorities WHERE level = 'normal'),
    (SELECT id FROM public.statuses WHERE status_name = 'pending'),
    'rmr'
RETURNING id, ticket_number, created_at;
-- Expected: ITR-2026-XXXXXX

DELETE FROM public.requests
WHERE title = 'Verification Test Request';

SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conrelid = 'public.requests'::regclass AND contype = 'f';
-- Expected: users, locations, categories, priorities, statuses.



