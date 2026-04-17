-- ============================================================
-- Migration 003: Add Google Maps URL to vendors table
-- Date: 2026-04-17
-- Description: Adds a maps_url column for storing Google Maps
--              share links on vendor/shop records.
-- ============================================================

ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS maps_url text;

COMMENT ON COLUMN public.vendors.maps_url IS 'Google Maps share link for the vendor location';
