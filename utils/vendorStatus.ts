
import { Vendor } from '../types';

/**
 * Traffic level display configuration.
 * Used by VendorList (dot color), VendorDetail (card), and AdminVendors (segmented control).
 */
export const TRAFFIC_CONFIG: Record<string, {
  label: string;
  description: string;
  dotClass: string;
  bgGradient: string;
  textClass: string;
  badgeBg: string;
}> = {
  low: {
    label: 'Low',
    description: 'No wait expected',
    dotClass: 'bg-green-500',
    bgGradient: 'from-green-500 to-emerald-600',
    textClass: 'text-green-600 dark:text-green-400',
    badgeBg: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  },
  moderate: {
    label: 'Moderate',
    description: 'Short wait possible',
    dotClass: 'bg-yellow-500',
    bgGradient: 'from-yellow-500 to-amber-600',
    textClass: 'text-yellow-600 dark:text-yellow-400',
    badgeBg: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  },
  high: {
    label: 'High',
    description: 'Expect 10-15 min wait',
    dotClass: 'bg-orange-500',
    bgGradient: 'from-orange-500 to-red-500',
    textClass: 'text-orange-600 dark:text-orange-400',
    badgeBg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  },
  very_busy: {
    label: 'Very Busy',
    description: 'Long wait expected',
    dotClass: 'bg-red-500',
    bgGradient: 'from-red-500 to-rose-600',
    textClass: 'text-red-600 dark:text-red-400',
    badgeBg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  },
};

/**
 * Returns the effective traffic config for a vendor.
 * Uses traffic_level if set and not expired, otherwise falls back to rush_level.
 * Maps rush_level 'mid' → 'moderate' for display consistency.
 */
export function getEffectiveTrafficConfig(vendor: Vendor) {
  // Check if there's an active (non-expired) traffic level override
  if (vendor.traffic_level) {
    const notExpired = !vendor.traffic_level_expires_at ||
      new Date(vendor.traffic_level_expires_at) > new Date();

    if (notExpired) {
      return {
        ...TRAFFIC_CONFIG[vendor.traffic_level] || TRAFFIC_CONFIG.low,
        isLive: true,
        key: vendor.traffic_level,
      };
    }
  }

  // Fall back to static rush_level, mapping 'mid' → 'moderate'
  const rushKey = vendor.rush_level === 'mid' ? 'moderate' : vendor.rush_level;
  return {
    ...TRAFFIC_CONFIG[rushKey] || TRAFFIC_CONFIG.low,
    isLive: false,
    key: rushKey,
  };
}
