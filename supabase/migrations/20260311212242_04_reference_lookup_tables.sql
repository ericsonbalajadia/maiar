-- ============================================================
-- reference Tables
-- Creates the ENUM and lookup tables required by the request system.


-- reate ENUM for PPSR service types (must exist before ppsr_details)
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

-- 2. locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_name VARCHAR(150) NOT NULL,
    room_number VARCHAR(50),
    floor_level VARCHAR(20),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT locations_building_room_unique UNIQUE NULLS NOT DISTINCT (building_name, room_number)
);

CREATE INDEX IF NOT EXISTS idx_locations_building ON public.locations(building_name);
CREATE INDEX IF NOT EXISTS idx_locations_active ON public.locations(is_active) WHERE is_active = TRUE;

-- 3. categories table (9 FM-GSO-09 checkboxes)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(50) NOT NULL UNIQUE CHECK (
        category_name IN (
            'electrical',
            'plumbing',
            'carpentry',
            'hvac',
            'welding',
            'vehicle_repair',
            'machining',
            'instrumentation',
            'general'
        )
    ),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(category_name);

-- 4. priorities table (SLA tiers)
CREATE TABLE IF NOT EXISTS public.priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL UNIQUE CHECK (
        level IN ('emergency', 'high', 'normal', 'low')
    ),
    response_time_hours INTEGER NOT NULL CHECK (response_time_hours > 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_priorities_level ON public.priorities(level);

-- 5. statuses table (workflow states)
CREATE TABLE IF NOT EXISTS public.statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status_name VARCHAR(30) NOT NULL UNIQUE CHECK (
        status_name IN (
            'pending',
            'under_review',
            'approved',
            'assigned',
            'in_progress',
            'completed',
            'cancelled'
        )
    ),
    description TEXT,
    is_terminal BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_statuses_name ON public.statuses(status_name);

-- 6. Seed reference data

-- Priorities seed
INSERT INTO public.priorities (level, response_time_hours, description)
VALUES
    ('emergency', 2, 'Immediate response required ΓÇô safety hazard'),
    ('high', 24, 'Major disruption ΓÇô respond within 24 hours'),
    ('normal', 72, 'Standard request ΓÇô respond within 3 days'),
    ('low', 168, 'Non-urgent ΓÇô respond within 7 days')
ON CONFLICT (level) DO NOTHING;

-- Statuses seed
INSERT INTO public.statuses (status_name, description, is_terminal)
VALUES
    ('pending', 'Request submitted, awaiting clerk review', FALSE),
    ('under_review', 'Being reviewed by GenSO clerk', FALSE),
    ('approved', 'Approved, ready for assignment', FALSE),
    ('assigned', 'Technician assigned', FALSE),
    ('in_progress', 'Work in progress', FALSE),
    ('completed', 'Request completed', TRUE),
    ('cancelled', 'Request cancelled', TRUE)
ON CONFLICT (status_name) DO NOTHING;

-- Categories seed (9 values)
INSERT INTO public.categories (category_name, description)
VALUES
    ('electrical', 'Electrical Works ΓÇô wiring, outlets, lighting'),
    ('plumbing', 'Plumbing Works ΓÇô pipes, faucets, drainage'),
    ('carpentry', 'Carpentry & Furniture Works ΓÇô doors, windows, furniture'),
    ('hvac', 'Heating, Ventilation, Air Conditioning & Refrigeration'),
    ('welding', 'Welding Works ΓÇô metal repairs'),
    ('vehicle_repair', 'Vehicle Repair ΓÇô university vehicles'),
    ('machining', 'Machining works (lathe, shaper, drill press, etc.)'),
    ('instrumentation', 'Instrumentation & Laboratory Equipment'),
    ('general', 'General maintenance or other tasks')
ON CONFLICT (category_name) DO NOTHING;

-- ======= Verification ===============
select
  typname,
  enumlabel
from
  pg_enum e
  join pg_type t on e.enumtypid = t.oid
where
  t.typname = 'ppsr_service_type';

-- Expected: 11 rows

select
  tablename
from
  pg_tables
where
  schemaname = 'public'
  and tablename in (
    'locations',
    'categories',
    'priorities',
    'statuses'
  );

-- Expected: All four tables


select
  'priorities' as table_name,
  COUNT(*)
from
  public.priorities
union all
select
  'statuses',
  COUNT(*)
from
  public.statuses
union all
select
  'categories',
  COUNT(*)
from
  public.categories;

-- Expected: prioritiess = 4, statuses = 7, categories = 9
