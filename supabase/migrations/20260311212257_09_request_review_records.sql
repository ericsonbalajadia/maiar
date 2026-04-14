-- ============================================================
-- request_reviews Table
-- I will record the clerk's review decision for each request.


--Create the request_reviews table
CREATE TABLE IF NOT EXISTS public.request_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID UNIQUE NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('approved', 'rejected', 'needs_info')),
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--Indexes common queries
CREATE INDEX IF NOT EXISTS idx_request_reviews_request ON public.request_reviews(request_id);
CREATE INDEX IF NOT EXISTS idx_request_reviews_reviewer ON public.request_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_request_reviews_decision_date ON public.request_reviews(decision, reviewed_at);

---trigger
CREATE TRIGGER update_request_reviews_updated_at
    BEFORE UPDATE ON public.request_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


CREATE OR REPLACE FUNCTION public.check_reviewer_role()
RETURNS TRIGGER AS $$
DECLARE
    reviewer_role VARCHAR(20);
BEGIN
    -- Check that the reviewer is a clerk
    SELECT role INTO reviewer_role
    FROM public.users
    WHERE id = NEW.reviewer_id;

    IF reviewer_role != 'clerk' THEN
        RAISE EXCEPTION 'Only clerks can submit request reviews';
    END IF;

    -- Require review_notes when decision is rejected or needs_info
    IF NEW.decision IN ('rejected', 'needs_info')
       AND (NEW.review_notes IS NULL OR trim(NEW.review_notes) = '') THEN
        RAISE EXCEPTION 'review_notes is required when decision is rejected or needs_info';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_reviewer_role
    BEFORE INSERT ON public.request_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.check_reviewer_role();
