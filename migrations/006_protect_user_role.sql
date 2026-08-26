-- ============================================================
-- Migration 006: Protect sensitive user columns from self-update
-- Date: 2026-07-02
-- 
-- PROBLEM: The RLS policy "Users can update their own profile"
--          allows users to update ANY column on their own row,
--          including `role`, `is_disabled`, and `loyalty_points`.
--          A malicious user can open the browser console, create
--          a Supabase client with the public anon key, and run:
--            supabase.from('users').update({ role: 'admin' })
--          to escalate their own privileges.
--
-- FIX:    A BEFORE UPDATE trigger that silently reverts changes
--         to protected columns unless the caller is an admin.
-- ============================================================

-- Trigger function: revert protected columns if caller is not admin
CREATE OR REPLACE FUNCTION public.protect_user_sensitive_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If the current user is NOT an admin, silently revert protected fields
  IF NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.is_disabled := OLD.is_disabled;
    NEW.loyalty_points := OLD.loyalty_points;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach to users table (drop first for idempotency)
DROP TRIGGER IF EXISTS trg_protect_user_sensitive_columns ON public.users;

CREATE TRIGGER trg_protect_user_sensitive_columns
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_sensitive_columns();

-- ============================================================
-- DONE! Non-admin users can no longer modify role, is_disabled,
-- or loyalty_points on their own row, even via direct DB access.
-- ============================================================
