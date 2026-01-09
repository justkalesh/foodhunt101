-- ============================================================
-- MIGRATION: Phase 1 - Critical Security Fixes
-- Date: 2026-01-09
-- Description: Secure user data, enforce admin permissions
-- ============================================================

-- ============================================================
-- STEP 1: DROP OLD INSECURE POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Vendors are viewable by everyone" ON public.vendors;
DROP POLICY IF EXISTS "Menu items are viewable by everyone" ON public.menu_items;

-- Drop any existing admin policies (in case of re-run)
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can insert vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can update vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can delete vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Admins can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Admins can delete menu items" ON public.menu_items;


-- ============================================================
-- STEP 2: CREATE ADMIN HELPER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role = 'admin'
  );
$$;


-- ============================================================
-- STEP 3: CREATE PUBLIC PROFILES VIEW (Safe data only)
-- ============================================================
-- Exposes: id, name, semester, role, pfp_url, loyalty_points
-- Hides: email, is_disabled, active_split_id, created_at, updated_at

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
-- STEP 4: USER TABLE - New Secure Policies
-- ============================================================
-- Only authenticated users can view profiles (not public)
CREATE POLICY "Authenticated users can view profiles" 
ON public.users 
FOR SELECT 
USING (auth.role() = 'authenticated');


-- ============================================================
-- STEP 5: VENDORS TABLE - Admin-Only Write Access
-- ============================================================
-- Everyone can view vendors (students need to browse)
CREATE POLICY "Vendors are viewable by everyone" 
ON public.vendors 
FOR SELECT 
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert vendors" 
ON public.vendors 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update vendors" 
ON public.vendors 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete vendors" 
ON public.vendors 
FOR DELETE 
USING (public.is_admin());


-- ============================================================
-- STEP 6: MENU ITEMS TABLE - Admin-Only Write Access
-- ============================================================
-- Everyone can view menu items (students need to browse menus)
CREATE POLICY "Menu items are viewable by everyone" 
ON public.menu_items 
FOR SELECT 
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert menu items" 
ON public.menu_items 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update menu items" 
ON public.menu_items 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete menu items" 
ON public.menu_items 
FOR DELETE 
USING (public.is_admin());


-- ============================================================
-- STEP 7: REVIEWS TABLE - Public Read, Authenticated Write
-- ============================================================
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own reviews" 
ON public.reviews 
FOR DELETE 
USING (auth.uid()::text = user_id);


-- ============================================================
-- STEP 8: MEAL_SPLITS TABLE - Authenticated Access
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view splits" ON public.meal_splits;
DROP POLICY IF EXISTS "Authenticated users can create splits" ON public.meal_splits;
DROP POLICY IF EXISTS "Creators can delete splits" ON public.meal_splits;

CREATE POLICY "Authenticated users can view splits" 
ON public.meal_splits 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create splits" 
ON public.meal_splits 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creators can delete splits" 
ON public.meal_splits 
FOR DELETE 
USING (auth.uid()::text = creator_id);


-- ============================================================
-- STEP 9: CONVERSATIONS TABLE - User-Specific Access
-- ============================================================
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their conversations" 
ON public.conversations 
FOR UPDATE 
USING (auth.uid()::text = any(participants));


-- ============================================================
-- STEP 10: CLEANUP - Remove "Public access" policies
-- ============================================================
DROP POLICY IF EXISTS "Public access" ON public.users;
DROP POLICY IF EXISTS "Public access" ON public.vendors;
DROP POLICY IF EXISTS "Public access" ON public.menu_items;
DROP POLICY IF EXISTS "Public access" ON public.conversations;
DROP POLICY IF EXISTS "Public access" ON public.messages;
DROP POLICY IF EXISTS "Public access" ON public.meal_splits;
DROP POLICY IF EXISTS "Public access" ON public.reviews;


-- ============================================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================================
-- Uncomment and run these to verify:

-- Check is_admin function exists:
-- SELECT proname FROM pg_proc WHERE proname = 'is_admin';

-- Check public_profiles view columns:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'public_profiles';

-- List all RLS policies:
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
