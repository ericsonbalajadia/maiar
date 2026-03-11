-- ============================================================
-- feedbacks Table


--Create the feedbacks table
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID UNIQUE NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.users(id),
    service_satisfaction INTEGER NOT NULL CHECK (service_satisfaction BETWEEN 1 AND 5),
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    comments TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--indexes
CREATE INDEX IF NOT EXISTS idx_feedbacks_request ON public.feedbacks(request_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_requester ON public.feedbacks(requester_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_submitted ON public.feedbacks(submitted_at DESC);

-- trigger
CREATE TRIGGER update_feedbacks_updated_at
    BEFORE UPDATE ON public.feedbacks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

--Helper function: can_submit_feedback
-- Returns TRUE if the request is completed, has no existing feedback,
-- and is within 30 days of completion.
CREATE OR REPLACE FUNCTION public.can_submit_feedback(p_request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    req_status VARCHAR;
    already_rated BOOLEAN;
    completed_at TIMESTAMPTZ;
BEGIN
    -- Get request status and actual completion date
    SELECT s.status_name, r.actual_completion_date
    INTO req_status, completed_at
    FROM public.requests r
    JOIN public.statuses s ON r.status_id = s.id
    WHERE r.id = p_request_id;

    -- Must be completed
    IF req_status IS NULL OR req_status != 'completed' THEN
        RETURN FALSE;
    END IF;

    -- Must not already have a feedback
    SELECT EXISTS (
        SELECT 1 FROM public.feedbacks WHERE request_id = p_request_id
    ) INTO already_rated;
    IF already_rated THEN
        RETURN FALSE;
    END IF;

    -- Must be within 30 days of completion
    IF completed_at IS NULL OR completed_at < NOW() - INTERVAL '30 days' THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
