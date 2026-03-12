-- ============================================================
--attachments Table


-- create the attachments table
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    feedback_id UUID NULL REFERENCES public.feedbacks(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 10485760), -- 10 MB max
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- XOR constraint: must belong to either a request OR a feedback, not both, not neither
    CONSTRAINT attachments_parent_check CHECK (
        (request_id IS NOT NULL AND feedback_id IS NULL) OR
        (request_id IS NULL AND feedback_id IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attachments_request ON public.attachments(request_id) WHERE request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attachments_feedback ON public.attachments(feedback_id) WHERE feedback_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attachments_uploader ON public.attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_created ON public.attachments(created_at DESC);

--Triggers
CREATE TRIGGER update_attachments_updated_at
    BEFORE UPDATE ON public.attachments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
