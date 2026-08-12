/**
 * TrackerLite — Location Tracking Hook
 * Orchestrates location service → store → database pipeline
 * Handles online direct POST vs offline queue routing
 */

import { useCallback, useEffect, useRef } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { useNetworkStore } from '@/store/useNetworkStore';
import * as locationService from '@/services/locationService';
import * as dbService from '@/services/dbService';
import * as apiService from '@/services/apiService';
import type { TripPoint, TrackingMode } from '@/types';
import { toISO } from '@/utils/formatters';

export function useLocationTracking() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const isTracking = useTripStore((s) => s.isTracking);
  const mode = useTripStore((s) => s.mode);
  const trip = useTripStore((s) => s.trip);
  const addCoordinate = useTripStore((s) => s.addCoordinate);
  const startTrip = useTripStore((s) => s.startTrip);
  const stopTrip = useTripStore((s) => s.stopTrip);
  const updateElapsedTime = useTripStore((s) => s.updateElapsedTime);
  const setMode = useTripStore((s) => s.setMode);

  const getEffectiveOnline = useNetworkStore((s) => s.getEffectiveOnline);
  const updatePendingCount = useNetworkStore((s) => s.updatePendingCount);

  /**
   * Handle each incoming location coordinate
   * Routes to direct POST (online) or SQLite queue (offline)
   */
  const handleLocationUpdate = useCallback(
    async (point: TripPoint) => {
      // Add to in-memory store for map rendering
      addCoordinate(point);

      const isOnline = getEffectiveOnline();

      if (isOnline) {
        // Online: POST directly to backend
        try {
          await apiService.postBatch([
            {
              id: point.id,
              trip_id: point.trip_id,
              timestamp: toISO(point.timestamp),
              latitude: point.latitude,
              longitude: point.longitude,
              accuracy: point.accuracy,
              speed: point.speed,
            },
          ]);
        } catch (error) {
          // If POST fails, fall back to queue
          console.warn('[Tracking] Direct POST failed, queueing:', error);
          await dbService.enqueuePoint(point);
          const count = await dbService.getPendingCount();
          updatePendingCount(count);
        }
      } else {
        // Offline: Queue to SQLite
        await dbService.enqueuePoint(point);
        const count = await dbService.getPendingCount();
        updatePendingCount(count);
      }
    },
    [addCoordinate, getEffectiveOnline, updatePendingCount]
  );

  /**
   * Start a new trip
   */
  const handleStartTrip = useCallback(
    async (trackingMode: TrackingMode) => {
      // Initialize database
      await dbService.initDatabase();

      // Create trip in store
      const tripId = startTrip(trackingMode);
      startTimeRef.current = Date.now();

      // Start elapsed time timer
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        updateElapsedTime(elapsed);
      }, 1000);

      // Start location tracking
      await locationService.startTracking(
        tripId,
        trackingMode,
        handleLocationUpdate
      );
    },
    [startTrip, updateElapsedTime, handleLocationUpdate]
  );

  /**
   * Stop the current trip
   */
  const handleStopTrip = useCallback(() => {
    locationService.stopTracking();
    stopTrip();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [stopTrip]);

  /**
   * Toggle tracking mode
   */
  const handleSetMode = useCallback(
    (newMode: TrackingMode) => {
      setMode(newMode);
    },
    [setMode]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      locationService.stopTracking();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    mode,
    trip,
    startTrip: handleStartTrip,
    stopTrip: handleStopTrip,
    setMode: handleSetMode,
  };
}
