/**
 * TrackerLite — Trip Store (Zustand)
 * Manages trip state, coordinates, timer, and statistics
 * Uses selective subscriptions for optimal re-render performance
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Trip,
  TripPoint,
  TripStatus,
  TrackingMode,
  Coordinate,
} from '@/types';
import { haversineDistance } from '@/utils/geometry';

interface TripState {
  // Trip data
  trip: Trip | null;
  coordinates: TripPoint[];
  isTracking: boolean;
  mode: TrackingMode;

  // Live statistics
  elapsedTime: number; // ms
  currentSpeed: number; // m/s
  totalDistance: number; // meters
  pointCount: number;

  // Actions
  startTrip: (mode: TrackingMode) => string; // Returns trip ID
  stopTrip: () => void;
  addCoordinate: (point: TripPoint) => void;
  setMode: (mode: TrackingMode) => void;
  updateElapsedTime: (time: number) => void;
  reset: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  trip: null,
  coordinates: [],
  isTracking: false,
  mode: 'simulated',
  elapsedTime: 0,
  currentSpeed: 0,
  totalDistance: 0,
  pointCount: 0,

  startTrip: (mode: TrackingMode) => {
    const tripId = `trip-${uuidv4().slice(0, 8)}`;
    const trip: Trip = {
      id: tripId,
      status: 'active',
      mode,
      startTime: Date.now(),
      endTime: null,
      pointCount: 0,
    };

    set({
      trip,
      coordinates: [],
      isTracking: true,
      mode,
      elapsedTime: 0,
      currentSpeed: 0,
      totalDistance: 0,
      pointCount: 0,
    });

    return tripId;
  },

  stopTrip: () => {
    const { trip } = get();
    if (trip) {
      set({
        trip: { ...trip, status: 'completed', endTime: Date.now() },
        isTracking: false,
      });
    }
  },

  addCoordinate: (point: TripPoint) => {
    const { coordinates, totalDistance } = get();

    let newDistance = totalDistance;
    if (coordinates.length > 0) {
      const lastCoord = coordinates[coordinates.length - 1];
      newDistance += haversineDistance(lastCoord, point);
    }

    set({
      coordinates: [...coordinates, point],
      currentSpeed: point.speed ?? 0,
      totalDistance: newDistance,
      pointCount: coordinates.length + 1,
    });
  },

  setMode: (mode: TrackingMode) => set({ mode }),

  updateElapsedTime: (time: number) => set({ elapsedTime: time }),

  reset: () =>
    set({
      trip: null,
      coordinates: [],
      isTracking: false,
      elapsedTime: 0,
      currentSpeed: 0,
      totalDistance: 0,
      pointCount: 0,
    }),
}));
