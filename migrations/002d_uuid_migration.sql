-- ============================================================
-- MIGRATION 002d: Migrate User IDs from Text to UUID
-- Date: 2026-01-09
-- Safety: BREAKING CHANGE - Run on staging first!
-- Prerequisite: All user IDs must be valid UUIDs
-- ============================================================

-- WARNING: This is a major schema change that will:
-- 1. Temporarily break foreign key constraints
-- 2. Require all existing user IDs to be valid UUID format
-- 3. Update all referencing tables
-- 
-- BEFORE RUNNING:
-- 1. Backup your database
-- 2. Verify all user IDs are valid UUIDs:
--    SELECT id FROM public.users WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
--    (Should return 0 rows)


-- ============================================================
-- STEP 1: DROP FOREIGN KEY CONSTRAINTS
-- ============================================================
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE public.meal_splits DROP CONSTRAINT IF EXISTS meal_splits_creator_id_fkey;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE public.split_join_requests DROP CONSTRAINT IF EXISTS split_join_requests_requester_id_fkey;
ALTER TABLE public.split_participants DROP CONSTRAINT IF EXISTS split_participants_user_id_fkey;


-- ============================================================
-- STEP 2: CONVERT USERS.ID TO UUID
-- ============================================================
ALTER TABLE public.users 
  ALTER COLUMN id TYPE uuid USING id::uuid;


-- ============================================================
-- STEP 3: CONVERT ALL REFERENCING COLUMNS TO UUID
-- ============================================================
ALTER TABLE public.reviews 
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.meal_splits 
  ALTER COLUMN creator_id TYPE uuid USING creator_id::uuid;

ALTER TABLE public.messages 
  ALTER COLUMN sender_id TYPE uuid USING sender_id::uuid,
  ALTER COLUMN receiver_id TYPE uuid USING receiver_id::uuid;

ALTER TABLE public.split_join_requests 
  ALTER COLUMN requester_id TYPE uuid USING requester_id::uuid;

ALTER TABLE public.split_participants 
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;


-- ============================================================
-- STEP 4: CONVERT CONVERSATIONS.PARTICIPANTS ARRAY
-- ============================================================
-- This requires special handling for the text[] to uuid[] conversion
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS participants_uuid uuid[];

UPDATE public.conversations 
SET participants_uuid = ARRAY(
  SELECT elem::uuid FROM unnest(participants) AS elem
)
WHERE participants IS NOT NULL;

ALTER TABLE public.conversations DROP COLUMN IF EXISTS participants;
ALTER TABLE public.conversations RENAME COLUMN participants_uuid TO participants;


-- ============================================================
-- STEP 5: RECREATE FOREIGN KEY CONSTRAINTS
-- ============================================================
ALTER TABLE public.reviews 
  ADD CONSTRAINT reviews_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE public.meal_splits 
  ADD CONSTRAINT meal_splits_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES public.users(id);

ALTER TABLE public.messages 
  ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES public.users(id);

ALTER TABLE public.messages 
  ADD CONSTRAINT messages_receiver_id_fkey 
  FOREIGN KEY (receiver_id) REFERENCES public.users(id);

ALTER TABLE public.split_join_requests 
  ADD CONSTRAINT split_join_requests_requester_id_fkey 
  FOREIGN KEY (requester_id) REFERENCES public.users(id);

ALTER TABLE public.split_participants 
  ADD CONSTRAINT split_participants_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- ============================================================
-- STEP 6: UPDATE RLS POLICIES (Remove ::text casts)
-- ============================================================
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Update split_participants policies
DROP POLICY IF EXISTS "Users can join splits" ON public.split_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON public.split_participants;
DROP POLICY IF EXISTS "Users or creators can delete participation" ON public.split_participants;

CREATE POLICY "Users can join splits"
ON public.split_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
ON public.split_participants
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users or creators can delete participation"
ON public.split_participants
FOR DELETE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.meal_splits 
    WHERE id = split_id AND creator_id = auth.uid()
  )
);


-- ============================================================
-- VERIFICATION
-- ============================================================
-- Check users.id is now UUID:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'id';
--
-- Check all FK columns are UUID:
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE column_name IN ('user_id', 'creator_id', 'sender_id', 'receiver_id', 'requester_id')
-- AND table_schema = 'public';
