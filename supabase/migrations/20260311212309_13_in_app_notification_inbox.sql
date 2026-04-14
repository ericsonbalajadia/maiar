-- ============================================================
-- notifications Table + Trigger Functions
-- InΓÇæapp notification inbox with automatic creation on key events.

-- create the notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'new_user_registered',
        'request_submitted',
        'request_approved',
        'request_rejected',
        'request_needs_info',
        'technician_assigned',
        'status_updated',
        'feedback_requested'
    )),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    read_at TIMESTAMPTZ,  -- NULL = unread
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_request ON public.notifications(request_id) WHERE request_id IS NOT NULL;

--Triggers
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


CREATE OR REPLACE FUNCTION public.notify_admin_of_new_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, type, subject, message)
    SELECT
        u.id,
        'new_user_registered',
        'New user registration pending approval',
        'A new user (' || NEW.full_name || ' - ' || NEW.email || ') has registered and is awaiting approval.'
    FROM public.users u
    WHERE u.role = 'admin' AND u.signup_status = 'approved';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_user_notify_admin
    AFTER INSERT ON public.users
    FOR EACH ROW
    WHEN (NEW.signup_status = 'pending')
    EXECUTE FUNCTION public.notify_admin_of_new_signup();

-- TRIGGER FUNCTIONS
CREATE OR REPLACE FUNCTION public.notify_requester_on_review()
RETURNS TRIGGER AS $$
DECLARE
    requester_id UUID;
    ticket VARCHAR(20);
    notify_type VARCHAR(50);
    notify_msg TEXT;
BEGIN
    SELECT r.requester_id, r.ticket_number
    INTO requester_id, ticket
    FROM public.requests r
    WHERE r.id = NEW.request_id;

    IF NEW.decision = 'approved' THEN
        notify_type := 'request_approved';
        notify_msg := 'Your request ' || ticket || ' has been approved and will be assigned soon.';
    ELSIF NEW.decision = 'rejected' THEN
        notify_type := 'request_rejected';
        notify_msg := 'Your request ' || ticket || ' was rejected. Reason: ' || COALESCE(NEW.review_notes, 'See details.');
    ELSE
        notify_type := 'request_needs_info';
        notify_msg := 'More information is needed for request ' || ticket || ': ' || COALESCE(NEW.review_notes, 'Please update your request.');
    END IF;

    INSERT INTO public.notifications (user_id, request_id, type, subject, message)
    VALUES (requester_id, NEW.request_id, notify_type, 'Update on request ' || ticket, notify_msg);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_notify_requester
    AFTER INSERT ON public.request_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_requester_on_review();

--TRIGGER FUNCTION 3: Notify technician when assigned
CREATE OR REPLACE FUNCTION public.notify_technician_assignment()
RETURNS TRIGGER AS $$
DECLARE
    ticket VARCHAR(20);
BEGIN
    SELECT ticket_number INTO ticket
    FROM public.requests
    WHERE id = NEW.request_id;

    INSERT INTO public.notifications (user_id, request_id, type, subject, message)
    VALUES (
        NEW.assigned_user_id,
        NEW.request_id,
        'technician_assigned',
        'New assignment: ' || ticket,
        'You have been assigned to request ' || ticket ||
        CASE WHEN NEW.notes IS NOT NULL THEN '. Note: ' || NEW.notes ELSE '' END
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_assignment_notify_technician
    AFTER INSERT ON public.request_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_technician_assignment();

-- TRIGGER FUNCTION 4: Notify requester when work is completed (feedback requested)
CREATE OR REPLACE FUNCTION public.notify_requester_on_completion()
RETURNS TRIGGER AS $$
DECLARE
    req_owner UUID;
    ticket VARCHAR(20);
BEGIN
    IF NEW.verified_by IS NOT NULL AND OLD.verified_by IS NULL THEN
        SELECT r.requester_id, r.ticket_number
        INTO req_owner, ticket
        FROM public.requests r
        WHERE r.id = NEW.request_id;

        INSERT INTO public.notifications (user_id, request_id, type, subject, message)
        VALUES (
            req_owner,
            NEW.request_id,
            'feedback_requested',
            'Request ' || ticket || ' completed ΓÇô please rate your experience',
            'Your request ' || ticket || ' has been completed. Please submit your feedback within 30 days.'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_completion_notify_requester
    AFTER UPDATE ON public.accomplishments
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_requester_on_completion();
