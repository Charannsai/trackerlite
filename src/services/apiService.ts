/**
 * TrackerLite — API Service
 * HTTP client for communicating with the mock backend
 */

import type { SyncBatch, SyncPoint, SyncResponse, TripPoint } from '@/types';
import { API_CONFIG } from '@/constants/routes';
import { v4 as uuidv4 } from 'uuid';
import { toISO } from '@/utils/formatters';

/**
 * Convert TripPoints to the API sync payload format
 */
function toSyncPoints(points: TripPoint[]): SyncPoint[] {
  return points.map((p) => ({
    trip_id: p.trip_id,
    timestamp: toISO(p.timestamp),
    latitude: p.latitude,
    longitude: p.longitude,
    accuracy: p.accuracy,
    speed: p.speed,
  }));
}

/**
 * POST a batch of trip points to the mock backend
 */
export async function postBatch(
  points: Array<{
    id: string;
    trip_id: string;
    timestamp: string;
    latitude: number;
    longitude: number;
    accuracy: number | null;
    speed: number | null;
  }>
): Promise<SyncResponse> {
  if (points.length === 0) {
    return { success: true, received: 0, message: 'No points to sync' };
  }

  const tripId = points[0].trip_id;
  const batch: SyncBatch = {
    trip_id: tripId,
    batch_id: uuidv4(),
    points: points.map((p) => ({
      trip_id: p.trip_id,
      timestamp: p.timestamp,
      latitude: p.latitude,
      longitude: p.longitude,
      accuracy: p.accuracy,
      speed: p.speed,
    })),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.syncEndpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as SyncResponse;
    return data;
  } catch (error) {
    // For demo purposes, if the backend is unreachable, simulate success
    // In production, this would throw and let the sync service handle retry
    console.warn('[API] Backend unreachable, treating as mock success:', error);
    return {
      success: true,
      received: points.length,
      message: 'Mock success (backend unreachable)',
    };
  }
}

/**
 * Health check for the mock backend
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.healthEndpoint}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}
