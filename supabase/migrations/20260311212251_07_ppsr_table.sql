-- ============================================================
-- ppsr_details Table
-- Creates the service details table for PPSR (FM-GSO-15).
-- This uuses JSONB for variable subΓÇæfields per service type.


-- ENUM exists (created in migration 005, but safe to check)
DO $$ BEGIN
    CREATE TYPE ppsr_service_type AS ENUM (
        'audio_system',
        'land_preparation',
        'site_development',
        'hauling',
        'tent_installation',
        'fabrication',
        'installation',
        'machining_works',
        'landscaping',
        'plans_layouts_estimates',
        'others'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- eate the ppsr_details table
CREATE TABLE IF NOT EXISTS public.ppsr_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID UNIQUE NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    service_type ppsr_service_type NOT NULL,
    service_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--Indexes
CREATE INDEX IF NOT EXISTS idx_ppsr_service_data ON public.ppsr_details USING GIN (service_data);
CREATE INDEX IF NOT EXISTS idx_ppsr_service_type ON public.ppsr_details (service_type);

--Trigger
CREATE TRIGGER update_ppsr_details_updated_at
    BEFORE UPDATE ON public.ppsr_details
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


CREATE OR REPLACE FUNCTION public.check_ppsr_request_type()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT request_type FROM public.requests WHERE id = NEW.request_id) != 'ppsr' THEN
        RAISE EXCEPTION 'ppsr_details can only be attached to request_type = ppsr';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_ppsr_request_type
    BEFORE INSERT ON public.ppsr_details
    FOR EACH ROW
    EXECUTE FUNCTION public.check_ppsr_request_type();



-- ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ 
-- JSONB service_data shapes (for reference ΓÇö enforced by Zod) 
-- ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ 
/* 
  audio_system: 
  { "with_lights": true, "setup_location": "AVR Building A", 
    "date_time_needed": "2026-03-15T08:00:00Z", 
    "estimated_duration_hrs": 4 } 
  
  land_preparation: 
  { "location_area": "Experimental Station Block 3", 
    "estimated_passing_trips": 6 } 
  
  site_development: 
  { "location": "North Campus Oval" } 
  
  hauling: 
  { "from_location": "Engineering Warehouse", 
    "to_location": "Main Campus Gymnasium" } 
  
  tent_installation: 
  { "setup_location": "University Oval", 
    "number_of_tents": 5, "tent_size": "10x10 meters" } 
  
  fabrication: 
  { "description_of_work": "New steel shelves for Lab 201" } 
  
  installation: 
  { "description_of_installation": "Signage at entrance gate" } 
  
  machining_works: 
  { "machine_type": "Lathe" } 
  
  landscaping: 
  { "location_area": "Administration Building grounds" } 
  
  plans_layouts_estimates: 
  { "plan_type": "Floor plan ΓÇö College of Engineering extension" } 
  
  others: 
  { "specify": "Installation of fire extinguisher brackets" } 
*/ 
