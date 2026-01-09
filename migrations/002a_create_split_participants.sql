-- ============================================================
-- MIGRATION 002a: Create Split Participants Table
-- Date: 2026-01-09
-- Safety: SAFE - Additive change only
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

-- Enable RLS
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
-- VERIFICATION
-- ============================================================
-- Run this to verify the table was created:
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'split_participants';
-- 
-- Check RLS policies:
-- SELECT policyname FROM pg_policies WHERE tablename = 'split_participants';
