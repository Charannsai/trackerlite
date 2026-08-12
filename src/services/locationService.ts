/**
 * TrackerLite — Location Service & Simulation Engine
 * Provides real GPS tracking via expo-location and simulated ride generation
 */

import * as Location from 'expo-location';
import { v4 as uuidv4 } from 'uuid';
import type { Coordinate, TripPoint, TrackingMode } from '@/types';
import { HYDERABAD_ROUTE, SIMULATION_INTERVAL_MS } from '@/constants/routes';
import {
  haversineDistance,
  calculateSpeed,
  calculateBearing,
  interpolateCoordinate,
} from '@/utils/geometry';

type LocationCallback = (point: TripPoint) => void;

let locationSubscription: Location.LocationSubscription | null = null;
let simulationTimer: ReturnType<typeof setInterval> | null = null;
let simulationIndex = 0;
let simulationFraction = 0;
let pointIndex = 0;

/**
 * Request location permissions
 */
export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();

  if (foregroundStatus !== 'granted') {
    return false;
  }

  return true;
}

/**
 * Start real GPS tracking
 */
export async function startRealTracking(
  tripId: string,
  onLocation: LocationCallback
): Promise<void> {
  pointIndex = 0;

  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) {
    throw new Error('Location permission not granted');
  }

  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 2000,
      distanceInterval: 5,
    },
    (location) => {
      const point: TripPoint = {
        id: uuidv4(),
        trip_id: tripId,
        index: pointIndex++,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        heading: location.coords.heading,
      };

      onLocation(point);
    }
  );
}

/**
 * Start simulated ride along the Hyderabad route
 */
export function startSimulatedTracking(
  tripId: string,
  onLocation: LocationCallback,
  speedMultiplier: number = 1.0
): void {
  pointIndex = 0;
  simulationIndex = 0;
  simulationFraction = 0;

  const route = HYDERABAD_ROUTE;

  simulationTimer = setInterval(() => {
    if (simulationIndex >= route.length - 1) {
      // Loop back to start for continuous demo
      simulationIndex = 0;
      simulationFraction = 0;
    }

    const currentWaypoint = route[simulationIndex];
    const nextWaypoint = route[simulationIndex + 1];

    // Interpolate position between waypoints
    const position = interpolateCoordinate(
      currentWaypoint,
      nextWaypoint,
      simulationFraction
    );

    // Add realistic GPS jitter (±2-8 meters)
    const jitterLat = (Math.random() - 0.5) * 0.00005;
    const jitterLon = (Math.random() - 0.5) * 0.00005;

    // Calculate realistic speed
    const speed = currentWaypoint.speedHint * speedMultiplier;

    // Calculate heading
    const heading = calculateBearing(currentWaypoint, nextWaypoint);

    const point: TripPoint = {
      id: uuidv4(),
      trip_id: tripId,
      index: pointIndex++,
      latitude: position.latitude + jitterLat,
      longitude: position.longitude + jitterLon,
      timestamp: Date.now(),
      accuracy: 3 + Math.random() * 5, // 3-8m accuracy
      speed: speed,
      heading: heading + (Math.random() - 0.5) * 5, // ±2.5° jitter
    };

    onLocation(point);

    // Advance simulation position
    const segmentDistance = haversineDistance(currentWaypoint, nextWaypoint);
    const distancePerTick = (speed * SIMULATION_INTERVAL_MS) / 1000; // meters per tick
    const fractionPerTick =
      segmentDistance > 0 ? distancePerTick / segmentDistance : 1;

    simulationFraction += fractionPerTick;

    if (simulationFraction >= 1) {
      simulationFraction = 0;
      simulationIndex++;
    }
  }, SIMULATION_INTERVAL_MS);
}

/**
 * Start tracking in the specified mode
 */
export async function startTracking(
  tripId: string,
  mode: TrackingMode,
  onLocation: LocationCallback,
  speedMultiplier?: number
): Promise<void> {
  stopTracking(); // Clean up any existing tracking

  if (mode === 'real') {
    await startRealTracking(tripId, onLocation);
  } else {
    startSimulatedTracking(tripId, onLocation, speedMultiplier);
  }
}

/**
 * Stop all tracking (real or simulated)
 */
export function stopTracking(): void {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }

  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }

  simulationIndex = 0;
  simulationFraction = 0;
  pointIndex = 0;
}

/**
 * Check if tracking is currently active
 */
export function isTrackingActive(): boolean {
  return locationSubscription !== null || simulationTimer !== null;
}
