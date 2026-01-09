-- ============================================================
-- MIGRATION 002c: Drop Old Array Column
-- Date: 2026-01-09
-- Safety: DESTRUCTIVE - Only run after verifying 002b migration
-- Prerequisite: Run 002a and 002b first, verify data integrity
-- ============================================================

-- WARNING: This permanently removes the people_joined_ids column!
-- Make sure 002b migration completed successfully before running.

ALTER TABLE public.meal_splits DROP COLUMN IF EXISTS people_joined_ids;

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Confirm column is gone:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'meal_splits' AND column_name = 'people_joined_ids';
-- (Should return 0 rows)
