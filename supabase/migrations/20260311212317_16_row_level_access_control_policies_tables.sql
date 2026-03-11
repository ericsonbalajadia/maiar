-- ============================================================
-- RLS Policies for All Phase 2 Tables
-- Enables RLS on all Phase 2 tables and creates policies.


-- -- -------------------------------------------------------------
-- Helper function to get the current user's internal ID
-- (used in policies that compare against auth.uid())
-- -- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() AND signup_status = 'approved';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- -- -------------------------------------------------------------
-- locations
-- -- -------------------------------------------------------------
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active locations"
  ON public.locations FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Staff can insert locations"
  ON public.locations FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role IN ('clerk','supervisor','admin')));

CREATE POLICY "Staff can update locations"
  ON public.locations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role IN ('clerk','supervisor','admin')));

CREATE POLICY "Only admins can delete locations"
  ON public.locations FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role = 'admin'));

-- -- -------------------------------------------------------------
-- categories
-- -- -------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view categories"
  ON public.categories FOR SELECT
  USING (is_active = TRUE OR EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role = 'admin'));

CREATE POLICY "Admins manage categories"
  ON public.categories FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role = 'admin'));

-- -------------------------------------------------------------
-- priorities
-- -------------------------------------------------------------
ALTER TABLE public.priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view priorities"
  ON public.priorities FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins manage priorities"
  ON public.priorities FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role = 'admin'));

-- -- -------------------------------------------------------------
-- statuses
-- -- -------------------------------------------------------------
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active statuses"
  ON public.statuses FOR SELECT
  USING (is_active = TRUE OR EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role = 'admin'));

CREATE POLICY "Admins manage statuses"
  ON public.statuses FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role = 'admin'));

-- -- -------------------------------------------------------------
-- requests
-- -- -------------------------------------------------------------
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Requesters view own requests
CREATE POLICY "Requesters view own requests" ON requests
    FOR SELECT USING (
        requester_id IN (
            SELECT id FROM users 
            WHERE auth_id = auth.uid()
            AND signup_status = 'approved'
        )
    );

-- Staff view all requests (clerk, technician, supervisor, admin)
CREATE POLICY "Staff view all requests"
  ON public.requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role IN ('clerk','technician','supervisor','admin')));

-- Technicians can view assigned requests via current active assignment
CREATE POLICY "Technicians view assigned requests"
  ON public.requests FOR SELECT
  USING (assigned_technician_id = current_user_id()
         OR EXISTS (SELECT 1 FROM public.request_assignments ra
                    WHERE ra.request_id = requests.id
                      AND ra.assigned_user_id = current_user_id()
                      AND ra.completed_at IS NULL));

-- Approved students/staff can create requests
CREATE POLICY "Approved users create requests"
  ON public.requests FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role IN ('student','staff') AND signup_status = 'approved'));

-- Staff can update requests (clerk, supervisor, admin)
CREATE POLICY "Staff update requests"
  ON public.requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role IN ('clerk','supervisor','admin')));

-- Technicians can update only specific fields on assigned requests (handled by trigger, but RLS allows update)
-- This policy allows technicians to update rows where they are the current technician.
CREATE POLICY "Technicians update assigned requests"
  ON public.requests FOR UPDATE
  USING (assigned_technician_id = current_user_id()
         OR EXISTS (SELECT 1 FROM public.request_assignments ra
                    WHERE ra.request_id = requests.id
                      AND ra.assigned_user_id = current_user_id()
                      AND ra.completed_at IS NULL));

-- Only admins can delete requests
CREATE POLICY "Admins delete requests"
  ON public.requests FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role = 'admin'));

-- Service role full access
CREATE POLICY "Service role full access on requests"
  ON public.requests FOR ALL
  USING (auth.role() = 'service_role');

-- -- -------------------------------------------------------------
-- rmr_details
-- -- -------------------------------------------------------------
ALTER TABLE public.rmr_details ENABLE ROW LEVEL SECURITY;

-- Staff can read all rmr_details
CREATE POLICY "Staff read rmr_details"
  ON public.rmr_details FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role IN ('clerk','technician','supervisor','admin')));

-- Requesters can view rmr_details for their own requests
CREATE POLICY "Requesters view own rmr_details"
  ON public.rmr_details FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.requests r WHERE r.id = rmr_details.request_id AND r.requester_id = current_user_id()));

-- Service role full access
CREATE POLICY "Service role full access rmr_details"
  ON public.rmr_details FOR ALL
  USING (auth.role() = 'service_role');

-- -- -------------------------------------------------------------
-- ppsr_details
-- -- -------------------------------------------------------------
ALTER TABLE public.ppsr_details ENABLE ROW LEVEL SECURITY;

-- Staff can read all ppsr_details
CREATE POLICY "Staff read ppsr_details"
  ON public.ppsr_details FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role IN ('clerk','technician','supervisor','admin')));

-- Requesters can view ppsr_details for their own requests
CREATE POLICY "Requesters view own ppsr_details"
  ON public.ppsr_details FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.requests r WHERE r.id = ppsr_details.request_id AND r.requester_id = current_user_id()));

-- Service role full access
CREATE POLICY "Service role full access ppsr_details"
  ON public.ppsr_details FOR ALL
  USING (auth.role() = 'service_role');

-- -- -------------------------------------------------------------
-- accomplishments
-- -- -------------------------------------------------------------
ALTER TABLE public.accomplishments ENABLE ROW LEVEL SECURITY;

-- Staff can read all accomplishments
CREATE POLICY "Staff read accomplishments"
  ON public.accomplishments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role IN ('clerk','technician','supervisor','admin')));

-- Requesters can view accomplishments for their own requests
CREATE POLICY "Requesters view own accomplishments"
  ON public.accomplishments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.requests r WHERE r.id = accomplishments.request_id AND r.requester_id = current_user_id()));

-- Service role full access
CREATE POLICY "Service role full access accomplishments"
  ON public.accomplishments FOR ALL
  USING (auth.role() = 'service_role');

-- -- -------------------------------------------------------------
-- request_reviews
-- -- -------------------------------------------------------------
ALTER TABLE public.request_reviews ENABLE ROW LEVEL SECURITY;

-- Staff can read all request_reviews
CREATE POLICY "Staff read request_reviews"
  ON public.request_reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role IN ('clerk','supervisor','admin')));

-- Requesters can view reviews for their own requests
CREATE POLICY "Requesters view own request_reviews"
  ON public.request_reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_reviews.request_id AND r.requester_id = current_user_id()));

-- Clerks can insert reviews
CREATE POLICY "Clerks insert request_reviews"
  ON public.request_reviews FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role IN ('clerk','admin')));

-- Service role full access
CREATE POLICY "Service role full access request_reviews"
  ON public.request_reviews FOR ALL
  USING (auth.role() = 'service_role');

-- -- -------------------------------------------------------------
-- request_assignments
-- -- -------------------------------------------------------------
ALTER TABLE public.request_assignments ENABLE ROW LEVEL SECURITY;

-- Supervisors and admins can manage all assignments
CREATE POLICY "Supervisors and admins manage assignments"
    ON public.request_assignments FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role IN ('supervisor','admin')));

-- Technicians can view their own assignments
CREATE POLICY "Technicians view own assignments"
    ON public.request_assignments FOR SELECT
    USING (assigned_user_id = current_user_id());

-- Technicians can update acceptance status and notes on their own active assignments
CREATE POLICY "Technicians update own assignments"
    ON public.request_assignments FOR UPDATE
    USING (assigned_user_id = current_user_id() AND completed_at IS NULL)
    WITH CHECK (assigned_user_id = current_user_id() AND completed_at IS NULL);

-- Requesters can view assignments for their own requests
CREATE POLICY "Requesters view assignments for own requests"
    ON public.request_assignments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.requests r
        WHERE r.id = request_assignments.request_id
          AND r.requester_id = current_user_id()
    ));

-- Service role full access
CREATE POLICY "Service role full access request_assignments"
    ON public.request_assignments FOR ALL
    USING (auth.role() = 'service_role');

-- -- -------------------------------------------------------------
-- feedbacks
-- -- -------------------------------------------------------------
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Requesters can insert feedback for their own requests (application checks can_submit_feedback)
CREATE POLICY "Requesters insert own feedback"
  ON public.feedbacks FOR INSERT
  WITH CHECK (requester_id = current_user_id());

-- Requesters can view their own feedback
CREATE POLICY "Requesters view own feedback"
  ON public.feedbacks FOR SELECT
  USING (requester_id = current_user_id());

-- Staff can view all feedback
CREATE POLICY "Staff view all feedback"
  ON public.feedbacks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role IN ('clerk','technician','supervisor','admin')));

-- Anonymous feedback is visible to all (but requester identity is hidden)
-- The is_anonymous flag is handled in application display, not RLS.
-- Service role full access
CREATE POLICY "Service role full access feedbacks"
  ON public.feedbacks FOR ALL
  USING (auth.role() = 'service_role');

-- -- -------------------------------------------------------------
-- attachments
-- -- -------------------------------------------------------------
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Uploaders manage their own attachments
CREATE POLICY "Uploaders manage own attachments"
  ON public.attachments FOR ALL
  USING (uploaded_by = current_user_id());

-- Staff can read all attachments
CREATE POLICY "Staff read all attachments"
  ON public.attachments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id() AND role IN ('clerk','technician','supervisor','admin')));

-- Requesters can view attachments for their own requests (via request or feedback)
CREATE POLICY "Requesters view own request attachments"
  ON public.attachments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.requests r WHERE r.id = attachments.request_id AND r.requester_id = current_user_id())
         OR EXISTS (SELECT 1 FROM public.feedbacks f JOIN public.requests r ON f.request_id = r.id
                    WHERE f.id = attachments.feedback_id AND r.requester_id = current_user_id()));

-- Service role full access
CREATE POLICY "Service role full access attachments"
  ON public.attachments FOR ALL
  USING (auth.role() = 'service_role');

-- -- -------------------------------------------------------------
-- notifications
-- -- -------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users view own notifications
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = current_user_id());

-- Users mark own notifications as read (update only read_at)
CREATE POLICY "Users mark own notifications read"
  ON public.notifications FOR UPDATE
  USING (user_id = current_user_id() AND read_at IS NULL)
  WITH CHECK (user_id = current_user_id());

-- Service role full access
CREATE POLICY "Service role full access notifications"
  ON public.notifications FOR ALL
  USING (auth.role() = 'service_role');

-- -- -------------------------------------------------------------
-- status_history
-- -- -------------------------------------------------------------
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read status_history (transparency)
CREATE POLICY "All authenticated read status_history"
  ON public.status_history FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

-- Only service_role can insert (via trigger)
CREATE POLICY "Service role insert status_history"
  ON public.status_history FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- No updates or deletes
CREATE POLICY "No updates on status_history"
  ON public.status_history FOR UPDATE USING (false);
CREATE POLICY "No deletes on status_history"
  ON public.status_history FOR DELETE USING (false);

-- -- -------------------------------------------------------------
-- notification_queue
-- -- -------------------------------------------------------------
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Only service_role can access this table
CREATE POLICY "Service role only notification_queue"
  ON public.notification_queue FOR ALL
  USING (auth.role() = 'service_role');

-- -- -------------------------------------------------------------
-- Final verification helper (optional)
-- -- -------------------------------------------------------------
-- After running, you can check RLS status with:
 SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
