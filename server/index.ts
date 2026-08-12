/**
 * TrackerLite — Mock Backend Server
 * Simple Express server that receives and logs synced trip points
 * 
 * Run: cd server && npm install && npm start
 * Endpoint: POST /api/sync — Accepts batch of trip points
 * Endpoint: GET /api/trips/:id — Returns all synced points for a trip
 * Endpoint: GET /api/health — Health check
 */

import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory storage
interface StoredPoint {
  trip_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  received_at: string;
}

const tripStorage = new Map<string, StoredPoint[]>();
let totalPointsReceived = 0;
let totalBatchesReceived = 0;

// ===== ROUTES =====

/**
 * Health check
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    totalPointsReceived,
    totalBatchesReceived,
    activeTripIds: Array.from(tripStorage.keys()),
  });
});

/**
 * Receive a batch of synced trip points
 */
app.post('/api/sync', (req: Request, res: Response) => {
  const { trip_id, batch_id, points } = req.body;

  if (!trip_id || !points || !Array.isArray(points)) {
    res.status(400).json({
      success: false,
      received: 0,
      message: 'Invalid payload: missing trip_id or points array',
    });
    return;
  }

  // Store points
  const existing = tripStorage.get(trip_id) || [];
  const receivedAt = new Date().toISOString();

  const newPoints: StoredPoint[] = points.map((p: StoredPoint) => ({
    ...p,
    received_at: receivedAt,
  }));

  tripStorage.set(trip_id, [...existing, ...newPoints]);
  totalPointsReceived += points.length;
  totalBatchesReceived++;

  // Log to console with color
  const total = tripStorage.get(trip_id)!.length;
  console.log(
    `\x1b[36m[SYNC]\x1b[0m Batch ${batch_id?.slice(0, 8) || '???'} | ` +
    `Trip: ${trip_id} | ` +
    `Points: \x1b[33m+${points.length}\x1b[0m (total: ${total}) | ` +
    `${receivedAt}`
  );

  // Log sample point
  if (points.length > 0) {
    const sample = points[0];
    console.log(
      `  └─ Sample: (${sample.latitude?.toFixed(6)}, ${sample.longitude?.toFixed(6)}) ` +
      `speed=${sample.speed?.toFixed(1) || 'N/A'} m/s`
    );
  }

  res.json({
    success: true,
    received: points.length,
    message: `Stored ${points.length} points for trip ${trip_id}`,
  });
});

/**
 * Get all synced points for a trip
 */
app.get('/api/trips/:id', (req: Request, res: Response) => {
  const tripId = req.params.id;
  const points = tripStorage.get(tripId);

  if (!points) {
    res.status(404).json({
      success: false,
      message: `Trip ${tripId} not found`,
    });
    return;
  }

  res.json({
    success: true,
    trip_id: tripId,
    point_count: points.length,
    points,
  });
});

/**
 * List all trips
 */
app.get('/api/trips', (_req: Request, res: Response) => {
  const trips = Array.from(tripStorage.entries()).map(([id, points]) => ({
    trip_id: id,
    point_count: points.length,
    first_point: points[0] || null,
    last_point: points[points.length - 1] || null,
  }));

  res.json({
    success: true,
    trips,
    totalPointsReceived,
    totalBatchesReceived,
  });
});

/**
 * Clear all data (for testing)
 */
app.delete('/api/reset', (_req: Request, res: Response) => {
  tripStorage.clear();
  totalPointsReceived = 0;
  totalBatchesReceived = 0;

  console.log('\x1b[31m[RESET]\x1b[0m All trip data cleared');

  res.json({
    success: true,
    message: 'All data cleared',
  });
});

// ===== START SERVER =====

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║         TrackerLite Mock Backend Server          ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  🌐 Running on: http://localhost:${PORT}            ║`);
  console.log('║                                                  ║');
  console.log('║  Endpoints:                                      ║');
  console.log('║    POST /api/sync     — Receive point batches    ║');
  console.log('║    GET  /api/health   — Health check             ║');
  console.log('║    GET  /api/trips    — List all trips           ║');
  console.log('║    GET  /api/trips/:id — Get trip points         ║');
  console.log('║    DELETE /api/reset  — Clear all data           ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log('Waiting for sync batches...');
  console.log('');
});
