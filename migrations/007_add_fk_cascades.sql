-- ============================================================
-- Migration 007: Add missing ON DELETE cascades to foreign keys
-- Date: 2026-07-02
--
-- PROBLEM: Several FK constraints have no ON DELETE behavior
--          (defaults to NO ACTION / RESTRICT). This means:
--          - Admin cannot delete a vendor that has reviews or splits
--          - Admin cannot delete a user that has messages, reviews, or splits
--          PostgreSQL will throw a FK violation error.
--
-- FIX:    Drop and recreate affected FK constraints with proper
--         ON DELETE behavior:
--         - CASCADE: child rows deleted with parent (reviews, join requests)
--         - SET NULL: child rows preserved, FK set to NULL (splits, messages)
--
-- NOTE:   In PostgreSQL, you cannot ALTER a FK constraint in-place.
--         You must DROP and re-ADD it.
-- ============================================================

-- ---- REVIEWS ----
-- reviews.vendor_id → CASCADE (reviews are meaningless without a vendor)
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_vendor_id_fkey;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_vendor_id_fkey
  FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;

-- reviews.user_id → CASCADE (delete user's reviews when user is deleted)
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- ---- MEAL SPLITS ----
-- meal_splits.vendor_id → SET NULL (preserve split history, vendor_name text field remains)
ALTER TABLE public.meal_splits
  DROP CONSTRAINT IF EXISTS meal_splits_vendor_id_fkey;
ALTER TABLE public.meal_splits
  ADD CONSTRAINT meal_splits_vendor_id_fkey
  FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;

-- meal_splits.creator_id → SET NULL (preserve split history, creator_name text field remains)
ALTER TABLE public.meal_splits
  DROP CONSTRAINT IF EXISTS meal_splits_creator_id_fkey;
ALTER TABLE public.meal_splits
  ADD CONSTRAINT meal_splits_creator_id_fkey
  FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE SET NULL;


-- ---- MESSAGES ----
-- messages.sender_id → SET NULL (preserve message content, show "Deleted User")
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages
  ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- messages.receiver_id → SET NULL
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE public.messages
  ADD CONSTRAINT messages_receiver_id_fkey
  FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- messages.request_id → SET NULL (message stays, but request link is cleared)
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_request_id_fkey;
ALTER TABLE public.messages
  ADD CONSTRAINT messages_request_id_fkey
  FOREIGN KEY (request_id) REFERENCES public.split_join_requests(id) ON DELETE SET NULL;


-- ---- SPLIT JOIN REQUESTS ----
-- split_join_requests.requester_id → CASCADE (delete requests when user is deleted)
ALTER TABLE public.split_join_requests
  DROP CONSTRAINT IF EXISTS split_join_requests_requester_id_fkey;
ALTER TABLE public.split_join_requests
  ADD CONSTRAINT split_join_requests_requester_id_fkey
  FOREIGN KEY (requester_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- ============================================================
-- DONE! Vendor and user deletion will now succeed without
-- FK violation errors. Split/message history is preserved
-- via SET NULL; reviews and join requests are cleaned up
-- via CASCADE.
-- ============================================================
