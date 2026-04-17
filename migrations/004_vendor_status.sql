-- ============================================================
-- Migration 004: Add real-time vendor status fields
-- Date: 2026-04-17
-- Description: Adds is_accepting_orders, traffic_level, and
--              traffic_level_expires_at for live vendor status.
-- ============================================================

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS is_accepting_orders boolean DEFAULT true;

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS traffic_level text
    CHECK (traffic_level IN ('low', 'moderate', 'high', 'very_busy'));

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS traffic_level_expires_at timestamp with time zone;

COMMENT ON COLUMN public.vendors.is_accepting_orders IS 'Vendor soft toggle: false = temporarily closed (sticky until admin changes)';
COMMENT ON COLUMN public.vendors.traffic_level IS 'Live traffic override: expires after 2 hours, then reverts to rush_level';
COMMENT ON COLUMN public.vendors.traffic_level_expires_at IS 'When the traffic_level override expires and reverts to rush_level';
