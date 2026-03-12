-- ============================================================
-- request_assignments Table
-- Tracks supervisor ΓåÆ technician assignment history.
-- Unique partial index ensures only one active assignment per request

-- Create the request_assignments table
CREATE TABLE IF NOT EXISTS public.request_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    assigned_user_id UUID NOT NULL REFERENCES public.users(id),
    assigned_by UUID NOT NULL REFERENCES public.users(id),

    -- TRUE = current active assignment
    -- Previous assignments are set to FALSE when a new one is created
    is_current_assignment BOOLEAN NOT NULL DEFAULT TRUE,

    -- Technician acknowledgement
    acceptance_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (acceptance_status IN ('pending', 'accepted', 'rejected')),

    notes TEXT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--indexes
CREATE INDEX IF NOT EXISTS idx_assignments_request
    ON public.request_assignments(request_id);
CREATE INDEX IF NOT EXISTS idx_assignments_technician
    ON public.request_assignments(assigned_user_id);


CREATE TRIGGER update_request_assignments_updated_at
    BEFORE UPDATE ON public.request_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

--ensure only technicians or supervisors can be assigned
CREATE OR REPLACE FUNCTION public.validate_technician_role()
RETURNS TRIGGER AS $$
DECLARE
    assignee_role VARCHAR(20);
BEGIN
    SELECT role INTO assignee_role
    FROM public.users
    WHERE id = NEW.assigned_user_id;

    IF assignee_role NOT IN ('technician', 'supervisor') THEN
        RAISE EXCEPTION 'Only technicians or supervisors can be assigned to requests';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_technician_role
    BEFORE INSERT ON public.request_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_technician_role();
