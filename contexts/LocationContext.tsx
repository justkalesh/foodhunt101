/**
 * LocationContext — Global location state shared across the app.
 * Provides GPS tracking, manual area selection, campus locations data,
 * and user addresses. Consumed by VendorList (sorting) and Chatbot (recommendations).
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CampusLocation, UserAddress } from '../types';
import { useUserLocation } from '../hooks/useUserLocation';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

// ============================================
// TYPES
// ============================================

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  /** The effective user coordinates (GPS or manually selected) */
  userCoords: LocationCoords | null;
  /** Human-readable label for the current location */
  selectedLabel: string;
  /** All predefined campus locations */
  campusLocations: CampusLocation[];
  /** User's custom saved addresses */
  userAddresses: UserAddress[];
  /** Whether GPS watchPosition is active */
  isGPSActive: boolean;
  /** GPS error message if any */
  gpsError: string | null;
  /** Whether GPS permission was denied */
  gpsPermissionDenied: boolean;
  /** Select a manual location (campus area or custom address) */
  setManualLocation: (coords: LocationCoords, label: string) => void;
  /** Start GPS tracking (clears manual selection) */
  startGPS: () => void;
  /** Stop GPS tracking */
  stopGPS: () => void;
  /** Add a custom user address */
  addUserAddress: (name: string, latitude: number, longitude: number) => Promise<boolean>;
  /** Delete a custom user address */
  deleteUserAddress: (id: string) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const gps = useUserLocation();

  const [campusLocations, setCampusLocations] = useState<CampusLocation[]>([]);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [manualLocation, setManualLocationState] = useState<{ coords: LocationCoords; label: string } | null>(null);

  // Fetch campus locations once on mount
  useEffect(() => {
    const fetchCampusLocations = async () => {
      const { data } = await supabase.from('campus_locations').select('*');
      if (data) setCampusLocations(data as CampusLocation[]);
    };
    fetchCampusLocations();
  }, []);

  // Fetch user addresses when user changes
  useEffect(() => {
    if (!user) {
      setUserAddresses([]);
      return;
    }
    const fetchUserAddresses = async () => {
      const { data } = await supabase.from('user_addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setUserAddresses(data as UserAddress[]);
    };
    fetchUserAddresses();
  }, [user?.id]);

  // Derived: effective coordinates
  const userCoords: LocationCoords | null = manualLocation
    ? manualLocation.coords
    : (gps.latitude !== null && gps.longitude !== null)
      ? { latitude: gps.latitude, longitude: gps.longitude }
      : null;

  const selectedLabel = manualLocation
    ? manualLocation.label
    : gps.isTracking
      ? (gps.latitude ? 'My Location' : 'Getting location...')
      : 'Select Location';

  // Actions
  const setManualLocation = useCallback((coords: LocationCoords, label: string) => {
    gps.stopTracking();
    setManualLocationState({ coords, label });
  }, [gps]);

  const startGPS = useCallback(() => {
    setManualLocationState(null);
    gps.startTracking();
  }, [gps]);

  const stopGPS = useCallback(() => {
    gps.stopTracking();
  }, [gps]);

  const addUserAddress = useCallback(async (name: string, latitude: number, longitude: number): Promise<boolean> => {
    if (!user) return false;
    const { data, error } = await supabase
      .from('user_addresses')
      .insert({ user_id: user.id, name, latitude, longitude })
      .select()
      .single();
    if (error) {
      console.error('Failed to save address:', error.message);
      return false;
    }
    if (data) setUserAddresses(prev => [data as UserAddress, ...prev]);
    return true;
  }, [user]);

  const deleteUserAddress = useCallback(async (id: string) => {
    await supabase.from('user_addresses').delete().eq('id', id);
    setUserAddresses(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <LocationContext.Provider value={{
      userCoords,
      selectedLabel,
      campusLocations,
      userAddresses,
      isGPSActive: gps.isTracking,
      gpsError: gps.error,
      gpsPermissionDenied: gps.permissionDenied,
      setManualLocation,
      startGPS,
      stopGPS,
      addUserAddress,
      deleteUserAddress,
    }}>
      {children}
    </LocationContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
