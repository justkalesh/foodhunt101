/**
 * Browser Geolocation hook using watchPosition for real-time GPS tracking.
 * Debounces updates to only fire when the user moves >30 meters.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { haversineDistance } from '../utils/location';

export interface UserLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isTracking: boolean;
  permissionDenied: boolean;
}

const DEBOUNCE_DISTANCE_KM = 0.03; // 30 meters

export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isTracking: false,
    permissionDenied: false,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation is not supported by your browser', isTracking: false }));
      return;
    }

    setState(prev => ({ ...prev, isTracking: true, error: null, permissionDenied: false }));

    // Get an immediate position first (faster initial load)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        lastCoordsRef.current = { lat: latitude, lng: longitude };
        setState(prev => ({ ...prev, latitude, longitude, accuracy, error: null }));
      },
      () => { /* watchPosition will handle errors */ },
      { enableHighAccuracy: true, timeout: 8000 }
    );

    // Then watch for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Debounce: only update if moved > 30m
        if (lastCoordsRef.current) {
          const dist = haversineDistance(
            lastCoordsRef.current.lat, lastCoordsRef.current.lng,
            latitude, longitude
          );
          if (dist < DEBOUNCE_DISTANCE_KM) return;
        }

        lastCoordsRef.current = { lat: latitude, lng: longitude };
        setState({ latitude, longitude, accuracy, error: null, isTracking: true, permissionDenied: false });
      },
      (error) => {
        const permissionDenied = error.code === error.PERMISSION_DENIED;
        setState(prev => ({
          ...prev,
          error: permissionDenied ? 'Location permission denied' : error.message,
          isTracking: false,
          permissionDenied,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    lastCoordsRef.current = null;
    setState(prev => ({ ...prev, isTracking: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { ...state, startTracking, stopTracking };
}
