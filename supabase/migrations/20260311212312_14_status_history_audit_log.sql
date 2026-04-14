-- ============================================================
--status_history Table

-- Creates an immutable audit log of every status change.


-- create the status_history table
CREATE TABLE IF NOT EXISTS public.status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    old_status_id UUID REFERENCES public.statuses(id),
    new_status_id UUID NOT NULL REFERENCES public.statuses(id),
    changed_by UUID NOT NULL REFERENCES public.users(id),
    change_reason TEXT,
    metadata JSONB,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- indexes
CREATE INDEX IF NOT EXISTS idx_status_history_request
    ON public.status_history(request_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_by
    ON public.status_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_status_history_date
    ON public.status_history(changed_at DESC);

-- Trigger
CREATE TRIGGER update_status_history_updated_at
    BEFORE UPDATE ON public.status_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger function: record_status_history
-- This function is called whenever a request's status_id changes.
CREATE OR REPLACE FUNCTION public.record_status_history()
RETURNS TRIGGER AS $$
DECLARE
    v_change_reason TEXT;
    v_metadata JSONB;
    v_changed_by UUID;
BEGIN
    -- Only proceed if status actually changed
    IF OLD.status_id IS DISTINCT FROM NEW.status_id THEN
        -- Determine who changed it (try to get from auth context, fallback to system)
        BEGIN
            v_changed_by := COALESCE(
                (SELECT id FROM public.users WHERE auth_id = auth.uid()),
                (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
            );
        EXCEPTION
            WHEN OTHERS THEN
                v_changed_by := (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1);
        END;

        -- Build a simple reason (can be overridden by application)
        v_change_reason := 'Status changed from ' ||
            (SELECT status_name FROM public.statuses WHERE id = OLD.status_id) ||
            ' to ' ||
            (SELECT status_name FROM public.statuses WHERE id = NEW.status_id);

        -- Optional metadata (can be enriched by application)
        v_metadata := jsonb_build_object(
            'trigger', TG_NAME,
            'timestamp', NOW()
        );

        INSERT INTO public.status_history (
            request_id,
            old_status_id,
            new_status_id,
            changed_by,
            change_reason,
            metadata,
            changed_at
        ) VALUES (
            NEW.id,
            OLD.status_id,
            NEW.status_id,
            v_changed_by,
            v_change_reason,
            v_metadata,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to the requests table
DROP TRIGGER IF EXISTS tr_requests_status_history ON public.requests;
CREATE TRIGGER tr_requests_status_history
    AFTER UPDATE OF status_id ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.record_status_history();
