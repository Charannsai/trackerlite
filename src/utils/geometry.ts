/**
 * TrackerLite — Geometry Utilities
 * Haversine distance, speed calculation, path simplification, bounds fitting
 */

import type { Coordinate, MapRegion } from '@/types';

const EARTH_RADIUS_M = 6371000;

/** Convert degrees to radians */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate the haversine distance between two GPS coordinates in meters
 */
export function haversineDistance(
  coord1: Pick<Coordinate, 'latitude' | 'longitude'>,
  coord2: Pick<Coordinate, 'latitude' | 'longitude'>
): number {
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

/**
 * Calculate speed (m/s) between two timestamped coordinates
 */
export function calculateSpeed(
  coord1: Pick<Coordinate, 'latitude' | 'longitude' | 'timestamp'>,
  coord2: Pick<Coordinate, 'latitude' | 'longitude' | 'timestamp'>
): number {
  const distance = haversineDistance(coord1, coord2);
  const timeDelta = Math.abs(coord2.timestamp - coord1.timestamp) / 1000; // seconds
  if (timeDelta === 0) return 0;
  return distance / timeDelta;
}

/**
 * Calculate the bearing (heading) from coord1 to coord2 in degrees
 */
export function calculateBearing(
  coord1: Pick<Coordinate, 'latitude' | 'longitude'>,
  coord2: Pick<Coordinate, 'latitude' | 'longitude'>
): number {
  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Douglas-Peucker path simplification
 * Reduces polyline complexity while maintaining shape fidelity
 */
export function simplifyPath(
  coords: Pick<Coordinate, 'latitude' | 'longitude'>[],
  tolerance: number = 0.00001
): Pick<Coordinate, 'latitude' | 'longitude'>[] {
  if (coords.length <= 2) return coords;

  // Find the point with maximum distance from the line
  let maxDist = 0;
  let maxIdx = 0;

  const first = coords[0];
  const last = coords[coords.length - 1];

  for (let i = 1; i < coords.length - 1; i++) {
    const dist = perpendicularDistance(coords[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }

  // If max distance exceeds tolerance, recursively simplify
  if (maxDist > tolerance) {
    const left = simplifyPath(coords.slice(0, maxIdx + 1), tolerance);
    const right = simplifyPath(coords.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

/** Perpendicular distance of a point from a line (lat/lng space) */
function perpendicularDistance(
  point: Pick<Coordinate, 'latitude' | 'longitude'>,
  lineStart: Pick<Coordinate, 'latitude' | 'longitude'>,
  lineEnd: Pick<Coordinate, 'latitude' | 'longitude'>
): number {
  const dx = lineEnd.longitude - lineStart.longitude;
  const dy = lineEnd.latitude - lineStart.latitude;

  if (dx === 0 && dy === 0) {
    return Math.sqrt(
      (point.longitude - lineStart.longitude) ** 2 +
        (point.latitude - lineStart.latitude) ** 2
    );
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.longitude - lineStart.longitude) * dx +
        (point.latitude - lineStart.latitude) * dy) /
        (dx * dx + dy * dy)
    )
  );

  const projLon = lineStart.longitude + t * dx;
  const projLat = lineStart.latitude + t * dy;

  return Math.sqrt(
    (point.longitude - projLon) ** 2 + (point.latitude - projLat) ** 2
  );
}

/**
 * Calculate a MapRegion that fits all given coordinates with padding
 */
export function fitBoundsRegion(
  coords: Pick<Coordinate, 'latitude' | 'longitude'>[],
  padding: number = 1.5
): MapRegion {
  if (coords.length === 0) {
    // Default: Hyderabad center
    return {
      latitude: 17.385044,
      longitude: 78.486671,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  if (coords.length === 1) {
    return {
      latitude: coords[0].latitude,
      longitude: coords[0].longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
  }

  let minLat = coords[0].latitude;
  let maxLat = coords[0].latitude;
  let minLon = coords[0].longitude;
  let maxLon = coords[0].longitude;

  for (const coord of coords) {
    minLat = Math.min(minLat, coord.latitude);
    maxLat = Math.max(maxLat, coord.latitude);
    minLon = Math.min(minLon, coord.longitude);
    maxLon = Math.max(maxLon, coord.longitude);
  }

  const latDelta = (maxLat - minLat) * padding || 0.005;
  const lonDelta = (maxLon - minLon) * padding || 0.005;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lonDelta,
  };
}

/**
 * Interpolate between two coordinates at a given fraction (0-1)
 */
export function interpolateCoordinate(
  start: Pick<Coordinate, 'latitude' | 'longitude'>,
  end: Pick<Coordinate, 'latitude' | 'longitude'>,
  fraction: number
): { latitude: number; longitude: number } {
  return {
    latitude: start.latitude + (end.latitude - start.latitude) * fraction,
    longitude: start.longitude + (end.longitude - start.longitude) * fraction,
  };
}
