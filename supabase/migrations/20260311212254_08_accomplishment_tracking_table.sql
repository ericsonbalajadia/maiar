-- ============================================================
-- accomplishments Table
-- Creates the shared accomplishments table for work completion
-- and verification. Trigger autoΓÇæcompletes the request when
-- verified_by is set


--Create the accomplishments table
CREATE TABLE IF NOT EXISTS public.accomplishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID UNIQUE NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    conducted_by UUID REFERENCES public.users(id),          -- Technician who performed the work
    started_at TIMESTAMPTZ,                               
    finished_at TIMESTAMPTZ,                              
    verified_by UUID REFERENCES public.users(id),           
    verified_at TIMESTAMPTZ,                                
    notes TEXT,                                           
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_accomplishment_dates CHECK (
        finished_at IS NULL OR started_at IS NULL OR finished_at >= started_at
    )
);

--Indexes 
CREATE INDEX IF NOT EXISTS idx_accomplishments_request ON public.accomplishments(request_id);
CREATE INDEX IF NOT EXISTS idx_accomplishments_conducted_by ON public.accomplishments(conducted_by);

-- Trigger
CREATE TRIGGER update_accomplishments_updated_at
    BEFORE UPDATE ON public.accomplishments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


CREATE OR REPLACE FUNCTION public.complete_request_on_verification()
RETURNS TRIGGER AS $$
DECLARE
    completed_status_id UUID;
BEGIN
    IF NEW.verified_by IS NOT NULL AND OLD.verified_by IS NULL THEN
    
        SELECT id INTO completed_status_id
        FROM public.statuses
        WHERE status_name = 'completed';

      
        UPDATE public.requests
        SET
            status_id = completed_status_id,
            actual_completion_date = COALESCE(NEW.finished_at::DATE, NOW()::DATE),
            updated_at = NOW()
        WHERE id = NEW.request_id;


        NEW.verified_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_accomplishment_verified
    AFTER UPDATE ON public.accomplishments
    FOR EACH ROW
    WHEN (NEW.verified_by IS NOT NULL AND OLD.verified_by IS NULL)
    EXECUTE FUNCTION public.complete_request_on_verification();
