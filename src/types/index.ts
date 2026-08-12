/**
 * TrackerLite — Type Definitions
 * All GPS, trip, queue, and network types. Zero `any` usage.
 */

/** A single GPS coordinate with metadata */
export interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp: number; // Unix ms
  accuracy: number | null;
  speed: number | null; // m/s
  heading: number | null; // degrees
}

/** A coordinate attached to a specific trip */
export interface TripPoint extends Coordinate {
  id: string; // UUID
  trip_id: string;
  index: number; // Sequential point number within the trip
}

/** Trip status enum */
export type TripStatus = 'idle' | 'active' | 'paused' | 'completed';

/** GPS tracking mode */
export type TrackingMode = 'real' | 'simulated';

/** A trip record */
export interface Trip {
  id: string; // UUID
  status: TripStatus;
  mode: TrackingMode;
  startTime: number; // Unix ms
  endTime: number | null;
  pointCount: number;
}

/** Outbox queue record for offline sync */
export interface QueuedPoint {
  id: string;
  trip_id: string;
  timestamp: string; // ISO 8601
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  status: 'pending' | 'syncing' | 'failed';
  attempt_count: number;
  idempotency_key: string;
  created_at: number; // Unix ms
}

/** Network status */
export interface NetworkStatus {
  isOnline: boolean;
  isManualOffline: boolean;
  effectiveOnline: boolean;
}

/** Batch sync payload sent to the backend */
export interface SyncBatch {
  trip_id: string;
  points: SyncPoint[];
  batch_id: string;
}

/** Individual point in a sync batch (API payload shape) */
export interface SyncPoint {
  trip_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
}

/** Map region for react-native-maps */
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/** Simulation route waypoint */
export interface RouteWaypoint {
  latitude: number;
  longitude: number;
  speedHint: number; // Suggested speed in m/s at this waypoint
}

/** Sync progress callback data */
export interface SyncProgress {
  totalPending: number;
  synced: number;
  failed: number;
  inProgress: boolean;
}

/** API response for batch sync */
export interface SyncResponse {
  success: boolean;
  received: number;
  message: string;
}
