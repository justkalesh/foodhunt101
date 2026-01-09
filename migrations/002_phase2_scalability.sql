-- ============================================================
-- MIGRATION: Phase 2 - Database Scalability Improvements
-- Date: 2026-01-09
-- Description: Normalize meal_splits, migrate user IDs to UUID
-- ============================================================

-- ============================================================
-- PART 1: CREATE SPLIT_PARTICIPANTS JOIN TABLE
-- ============================================================

-- Create the normalized join table for meal split participants
CREATE TABLE IF NOT EXISTS public.split_participants (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  split_id uuid NOT NULL REFERENCES public.meal_splits(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  status text DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'removed')),
  UNIQUE(split_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_split_participants_split_id ON public.split_participants(split_id);
CREATE INDEX IF NOT EXISTS idx_split_participants_user_id ON public.split_participants(user_id);


-- ============================================================
-- PART 2: MIGRATE EXISTING DATA FROM ARRAY TO JOIN TABLE
-- ============================================================

-- Migrate existing people_joined_ids array data to new table
INSERT INTO public.split_participants (split_id, user_id, joined_at, status)
SELECT 
  ms.id as split_id,
  unnest(ms.people_joined_ids) as user_id,
  ms.created_at as joined_at,
  'joined' as status
FROM public.meal_splits ms
WHERE ms.people_joined_ids IS NOT NULL 
  AND array_length(ms.people_joined_ids, 1) > 0
ON CONFLICT (split_id, user_id) DO NOTHING;


-- ============================================================
-- PART 3: RLS POLICIES FOR SPLIT_PARTICIPANTS
-- ============================================================

ALTER TABLE public.split_participants ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view participants (needed for split details)
CREATE POLICY "Authenticated users can view participants"
ON public.split_participants
FOR SELECT
USING (auth.role() = 'authenticated');

-- Users can join splits (insert themselves)
CREATE POLICY "Users can join splits"
ON public.split_participants
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Users can leave splits (update their own status)
CREATE POLICY "Users can update their participation"
ON public.split_participants
FOR UPDATE
USING (auth.uid()::text = user_id);

-- Users can remove themselves, creators can remove anyone
CREATE POLICY "Users or creators can delete participation"
ON public.split_participants
FOR DELETE
USING (
  auth.uid()::text = user_id OR
  EXISTS (
    SELECT 1 FROM public.meal_splits 
    WHERE id = split_id AND creator_id = auth.uid()::text
  )
);


-- ============================================================
-- PART 4: DROP OLD ARRAY COLUMN (Run after verifying migration)
-- ============================================================

-- WARNING: Uncomment only after confirming data migration is complete!
-- ALTER TABLE public.meal_splits DROP COLUMN IF EXISTS people_joined_ids;


-- ============================================================
-- PART 5: MIGRATE USER IDs FROM TEXT TO UUID
-- ============================================================
-- WARNING: This is a breaking change. Run on staging first!
-- These commands must be run in order due to FK dependencies.

-- Step 5.1: Drop existing foreign key constraints
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE public.meal_splits DROP CONSTRAINT IF EXISTS meal_splits_creator_id_fkey;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE public.split_join_requests DROP CONSTRAINT IF EXISTS split_join_requests_requester_id_fkey;
ALTER TABLE public.split_participants DROP CONSTRAINT IF EXISTS split_participants_user_id_fkey;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_participants_fkey;

-- Step 5.2: Alter the users.id column to UUID
ALTER TABLE public.users 
  ALTER COLUMN id TYPE uuid USING id::uuid;

-- Step 5.3: Alter all referencing columns to UUID
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

-- Note: conversations.participants is a text[] array, needs special handling
-- This creates a new column, migrates data, then swaps
ALTER TABLE public.conversations ADD COLUMN participants_uuid uuid[];
UPDATE public.conversations 
  SET participants_uuid = ARRAY(
    SELECT elem::uuid FROM unnest(participants) AS elem
  );
ALTER TABLE public.conversations DROP COLUMN participants;
ALTER TABLE public.conversations RENAME COLUMN participants_uuid TO participants;

-- Step 5.4: Re-add foreign key constraints
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
-- PART 6: UPDATE RLS POLICIES FOR UUID COMPARISON
-- ============================================================
-- Policies using auth.uid()::text = id need to change to auth.uid() = id

-- Drop old policies that used text comparison
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Recreate with UUID comparison
CREATE POLICY "Authenticated users can view profiles" 
ON public.users FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);


-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check split_participants table exists and has data
-- SELECT COUNT(*) FROM public.split_participants;

-- Verify users.id is now UUID type
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'id';

-- List all foreign keys referencing users
-- SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
-- WHERE constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users';
