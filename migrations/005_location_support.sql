-- Migration: Location support for proximity-based vendor sorting
-- Adds campus_locations (predefined areas) and user_addresses (custom saved locations)

-- ============================================
-- 1. Campus Locations (predefined LPU areas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.campus_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL
);

-- Seed LPU campus locations
INSERT INTO public.campus_locations (name, latitude, longitude) VALUES
  ('CC',                    31.25778,   75.70817),
  ('BH1',                   31.250611,  75.6991928),
  ('NK Food Court',         31.246981,  75.7038403),
  ('Apartments Food Court', 31.2521072, 75.7017688),
  ('34 Block',              31.250667,  75.704611),
  ('Uni-Mall',              31.2555561, 75.7051335)
ON CONFLICT (name) DO NOTHING;

-- RLS: Anyone can read campus locations
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read campus_locations" ON public.campus_locations FOR SELECT USING (true);

-- ============================================
-- 2. User Addresses (custom saved locations)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS: Users manage their own addresses
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own addresses" ON public.user_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON public.user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.user_addresses FOR DELETE USING (auth.uid() = user_id);
