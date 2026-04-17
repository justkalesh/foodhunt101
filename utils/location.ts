/**
 * Location utilities for distance calculation and vendor sorting.
 * Uses the Haversine formula for accurate great-circle distance on Earth.
 */

import { CampusLocation, Vendor } from '../types';

// ============================================
// HAVERSINE DISTANCE
// ============================================

const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_KM = 6371;

/**
 * Calculate distance between two GPS coordinates using the Haversine formula.
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) *
    Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Format a distance in km to a human-readable string.
 * e.g. 0.05 → "50 m", 1.23 → "1.2 km"
 */
export function formatDistance(km: number): string {
  if (km < 0.1) return `${Math.round(km * 1000)} m`;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// ============================================
// VENDOR DISTANCE CALCULATION
// ============================================

/**
 * Build a lookup map from campus location names to coordinates.
 */
export function buildLocationMap(
  campusLocations: CampusLocation[]
): Map<string, { latitude: number; longitude: number }> {
  const map = new Map<string, { latitude: number; longitude: number }>();
  for (const loc of campusLocations) {
    map.set(loc.name.toLowerCase(), { latitude: loc.latitude, longitude: loc.longitude });
  }
  return map;
}

/**
 * Calculate distances from a user position to all vendors.
 * Vendors are matched to campus_locations by their `location` field.
 * Returns a Map of vendorId → distance in km. Unmatched vendors get Infinity.
 */
export function calculateVendorDistances(
  vendors: Vendor[],
  locationMap: Map<string, { latitude: number; longitude: number }>,
  userLat: number,
  userLng: number
): Map<string, number> {
  const distances = new Map<string, number>();
  for (const vendor of vendors) {
    const coords = locationMap.get(vendor.location?.toLowerCase() || '');
    if (coords) {
      distances.set(vendor.id, haversineDistance(userLat, userLng, coords.latitude, coords.longitude));
    } else {
      distances.set(vendor.id, Infinity);
    }
  }
  return distances;
}

/**
 * Sort vendors by distance (ascending). Vendors without a matching
 * campus location are placed at the end.
 */
export function sortByDistance(
  vendors: Vendor[],
  distances: Map<string, number>
): Vendor[] {
  return [...vendors].sort((a, b) => {
    const da = distances.get(a.id) ?? Infinity;
    const db = distances.get(b.id) ?? Infinity;
    return da - db;
  });
}
