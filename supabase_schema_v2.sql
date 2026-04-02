-- ============================================================
-- FOOD-HUNT: Consolidated Database Schema (v2)
-- Date: 2026-03-21
-- Description: Complete, up-to-date schema merging base + all migrations.
--              Run this in Supabase SQL Editor to create all tables.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  uid text,                    -- Unique 6-digit identifier for easy sharing
  email text UNIQUE NOT NULL,
  name text,
  semester text,
  role text DEFAULT 'student',
  is_disabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  loyalty_points integer DEFAULT 0,
  active_split_id text,
  pfp_url text,
  is_verified boolean DEFAULT false,
  aadhaar_verified_at timestamp with time zone
);

-- VENDORS TABLE
CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  location text,
  cuisine text,
  origin_tag text,
  rush_level text CHECK (rush_level IN ('low', 'mid', 'high')),
  logo_url text,
  menu_image_urls text[],
  contact_number text,
  lowest_item_price numeric,
  avg_price_per_meal numeric,
  popularity_score integer DEFAULT 0,
  is_active boolean DEFAULT true,
  rating_avg numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  sort_order integer DEFAULT 999,
  recommended_item_name text,
  recommended_item_price numeric,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id),
  vendor_id uuid REFERENCES public.vendors(id),
  rating integer,
  review_text text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
  name text,
  price numeric,
  category text,
  is_active boolean DEFAULT true,
  is_recommended boolean DEFAULT false,
  small_price numeric,
  medium_price numeric,
  large_price numeric,
  xl_price numeric
);

-- MEAL SPLITS TABLE
CREATE TABLE IF NOT EXISTS public.meal_splits (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id uuid REFERENCES public.users(id),
  creator_name text,
  vendor_id uuid REFERENCES public.vendors(id),
  vendor_name text,
  dish_name text,
  total_price numeric,
  people_needed integer,
  time_note text,
  split_time timestamp with time zone,
  is_closed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id text PRIMARY KEY,
  participants uuid[],
  participant_details jsonb,
  last_message jsonb,
  unread_counts jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id text REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.users(id),
  receiver_id uuid REFERENCES public.users(id),
  content text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- SPLIT JOIN REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.split_join_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  split_id uuid REFERENCES public.meal_splits(id) ON DELETE CASCADE,
  requester_id uuid REFERENCES public.users(id),
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(split_id, requester_id)
);

-- Add request_id FK on messages (linking chat messages to join requests)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS request_id uuid REFERENCES public.split_join_requests(id);

-- SPLIT PARTICIPANTS TABLE (normalized join table)
CREATE TABLE IF NOT EXISTS public.split_participants (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  split_id uuid NOT NULL REFERENCES public.meal_splits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  status text DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'removed')),
  UNIQUE(split_id, user_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_split_participants_split_id ON public.split_participants(split_id);
CREATE INDEX IF NOT EXISTS idx_split_participants_user_id ON public.split_participants(user_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- ============================================================
-- PUBLIC PROFILES VIEW (Safe public data only)
-- ============================================================
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT
  id,
  name,
  semester,
  role,
  pfp_url,
  loyalty_points
FROM public.users;

GRANT SELECT ON public.public_profiles TO authenticated;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- ---- USERS ----
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.users;
CREATE POLICY "Authenticated users can view profiles"
ON public.users FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- ---- VENDORS ----
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors are viewable by everyone" ON public.vendors;
CREATE POLICY "Vendors are viewable by everyone"
ON public.vendors FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can insert vendors" ON public.vendors;
CREATE POLICY "Admins can insert vendors"
ON public.vendors FOR INSERT
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update vendors" ON public.vendors;
CREATE POLICY "Admins can update vendors"
ON public.vendors FOR UPDATE
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete vendors" ON public.vendors;
CREATE POLICY "Admins can delete vendors"
ON public.vendors FOR DELETE
USING (public.is_admin());

-- ---- REVIEWS ----
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
CREATE POLICY "Users can delete their own reviews"
ON public.reviews FOR DELETE
USING (auth.uid() = user_id);

-- ---- MENU ITEMS ----
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Menu items are viewable by everyone" ON public.menu_items;
CREATE POLICY "Menu items are viewable by everyone"
ON public.menu_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can insert menu items" ON public.menu_items;
CREATE POLICY "Admins can insert menu items"
ON public.menu_items FOR INSERT
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update menu items" ON public.menu_items;
CREATE POLICY "Admins can update menu items"
ON public.menu_items FOR UPDATE
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete menu items" ON public.menu_items;
CREATE POLICY "Admins can delete menu items"
ON public.menu_items FOR DELETE
USING (public.is_admin());

-- ---- MEAL SPLITS ----
ALTER TABLE public.meal_splits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view splits" ON public.meal_splits;
CREATE POLICY "Authenticated users can view splits"
ON public.meal_splits FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create splits" ON public.meal_splits;
CREATE POLICY "Authenticated users can create splits"
ON public.meal_splits FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Creators can update splits" ON public.meal_splits;
CREATE POLICY "Creators can update splits"
ON public.meal_splits FOR UPDATE
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can delete splits" ON public.meal_splits;
CREATE POLICY "Creators can delete splits"
ON public.meal_splits FOR DELETE
USING (auth.uid() = creator_id);

-- ---- CONVERSATIONS ----
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = ANY(participants));

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
CREATE POLICY "Users can update their conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = ANY(participants));

DROP POLICY IF EXISTS "Users can delete their conversations" ON public.conversations;
CREATE POLICY "Users can delete their conversations"
ON public.conversations FOR DELETE
USING (auth.uid() = ANY(participants));

-- ---- MESSAGES ----
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their messages" ON public.messages;
CREATE POLICY "Users can update their messages"
ON public.messages FOR UPDATE
USING (auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can delete their messages" ON public.messages;
CREATE POLICY "Users can delete their messages"
ON public.messages FOR DELETE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ---- SPLIT JOIN REQUESTS ----
ALTER TABLE public.split_join_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view relevant requests" ON public.split_join_requests;
CREATE POLICY "Users can view relevant requests"
ON public.split_join_requests FOR SELECT
USING (
  auth.uid() = requester_id OR
  EXISTS (SELECT 1 FROM public.meal_splits WHERE id = split_id AND creator_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create requests" ON public.split_join_requests;
CREATE POLICY "Users can create requests"
ON public.split_join_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Creators can update requests" ON public.split_join_requests;
CREATE POLICY "Creators can update requests"
ON public.split_join_requests FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.meal_splits WHERE id = split_id AND creator_id = auth.uid())
);

DROP POLICY IF EXISTS "Requesters can delete requests" ON public.split_join_requests;
CREATE POLICY "Requesters can delete requests"
ON public.split_join_requests FOR DELETE
USING (auth.uid() = requester_id);

-- ---- SPLIT PARTICIPANTS ----
ALTER TABLE public.split_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view participants" ON public.split_participants;
CREATE POLICY "Authenticated users can view participants"
ON public.split_participants FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can join splits" ON public.split_participants;
CREATE POLICY "Users can join splits"
ON public.split_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their participation" ON public.split_participants;
CREATE POLICY "Users can update their participation"
ON public.split_participants FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users or creators can delete participation" ON public.split_participants;
CREATE POLICY "Users or creators can delete participation"
ON public.split_participants FOR DELETE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.meal_splits
    WHERE id = split_id AND creator_id = auth.uid()
  )
);

-- ============================================================
-- DONE! All tables, views, functions, and RLS policies created.
-- ============================================================
