-- ============================================================
-- MIGRATION 002b: Migrate Data from Array to Join Table
-- Date: 2026-01-09
-- Safety: SAFE - Data copy only, no destructive changes
-- Prerequisite: Run 002a first
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
-- VERIFICATION
-- ============================================================
-- Check how many records were migrated:
-- SELECT COUNT(*) as migrated_count FROM public.split_participants;
--
-- Compare with original data:
-- SELECT 
--   ms.id,
--   array_length(ms.people_joined_ids, 1) as array_count,
--   (SELECT COUNT(*) FROM split_participants sp WHERE sp.split_id = ms.id) as table_count
-- FROM meal_splits ms
-- WHERE ms.people_joined_ids IS NOT NULL;
