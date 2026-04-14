-- ============================================================
-- rmr_details Table
-- This creates the inspection details table for RMR (FM-GSO-09).


-- Create the rmr_details table
CREATE TABLE IF NOT EXISTS public.rmr_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID UNIQUE NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    repair_mode VARCHAR(20) CHECK (repair_mode IN ('in_house', 'outsourced')),
    materials_available BOOLEAN,
    manpower_required INTEGER CHECK (manpower_required >= 0),
    estimated_duration VARCHAR(100),
    schedule_notes TEXT,
    inspection_date DATE,
    inspection_time_start TIME,
    inspection_time_end TIME,
    inspected_by UUID REFERENCES public.users(id),
    inspection_confirmed_by UUID REFERENCES public.users(id),
    inspector_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index 
CREATE INDEX IF NOT EXISTS idx_rmr_details_request ON public.rmr_details(request_id);

-- Triggers
CREATE TRIGGER update_rmr_details_updated_at
    BEFORE UPDATE ON public.rmr_details
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


CREATE OR REPLACE FUNCTION public.check_rmr_request_type()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT request_type FROM public.requests WHERE id = NEW.request_id) != 'rmr' THEN
        RAISE EXCEPTION 'rmr_details can only be attached to request_type = rmr';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_rmr_request_type
    BEFORE INSERT ON public.rmr_details
    FOR EACH ROW
    EXECUTE FUNCTION public.check_rmr_request_type();


-- ========= VERIFICATION ==========
-- Insert an RMR test request
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
    (SELECT id FROM public.users LIMIT 1),
    'RMR Test for rmr_details',
    'This request is RMR, should accept rmr_details',
    (SELECT id FROM public.locations LIMIT 1),
    (SELECT id FROM public.priorities WHERE level = 'normal'),
    (SELECT id FROM public.statuses WHERE status_name = 'pending'),
    'rmr'
RETURNING id AS rmr_id;

INSERT INTO public.rmr_details (
    request_id,
    repair_mode,
    materials_available,
    manpower_required,
    estimated_duration,
    schedule_notes,
    inspection_date
) VALUES (
    'a0bfb3a0-0655-4fee-9bd9-b25a61fbccfe',
    'in_house',
    TRUE,
    2,
    '3 hours',
    'Schedule after 2pm',
    CURRENT_DATE
)
RETURNING id;

DELETE FROM public.rmr_details WHERE request_id IN (
    SELECT id FROM public.requests WHERE title LIKE '%Test%'
);
DELETE FROM public.requests WHERE title LIKE '%Test%';
