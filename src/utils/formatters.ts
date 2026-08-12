/**
 * TrackerLite — Display Formatters
 * Human-readable formatting for duration, speed, and distance
 */

/**
 * Format milliseconds to HH:MM:SS
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format speed from m/s to km/h string
 */
export function formatSpeed(metersPerSecond: number | null): string {
  if (metersPerSecond === null || metersPerSecond < 0) return '0 km/h';
  const kmh = metersPerSecond * 3.6;
  return `${Math.round(kmh)} km/h`;
}

/**
 * Format distance in meters to human-readable string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format a Unix timestamp to ISO 8601 string
 */
export function toISO(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Format a count with label (e.g., "14 pts")
 */
export function formatQueueCount(count: number): string {
  if (count === 0) return 'Queue empty';
  return `${count} pt${count === 1 ? '' : 's'} cached`;
}

/**
 * Format timestamp to short time string (e.g., "4:32 PM")
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}
