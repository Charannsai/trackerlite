/**
 * TrackerLite — SQLite Database Service
 * Outbox-pattern queue for offline coordinate storage
 * Transaction-safe, crash-resilient, with batch operations
 */

import * as SQLite from 'expo-sqlite';
import { uuidv4 } from '@/utils/uuid';
import type { QueuedPoint, TripPoint } from '@/types';
import { toISO } from '@/utils/formatters';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the SQLite database and create the outbox table
 */
export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('trackerlite.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracy REAL,
      speed REAL,
      status TEXT DEFAULT 'pending',
      attempt_count INTEGER DEFAULT 0,
      idempotency_key TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox(status);
    CREATE INDEX IF NOT EXISTS idx_outbox_created ON outbox(created_at);
  `);
}

/**
 * Get the database instance, initializing if needed
 */
async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    await initDatabase();
  }
  return db!;
}

/**
 * Enqueue a trip point into the offline outbox
 */
export async function enqueuePoint(point: TripPoint): Promise<void> {
  const database = await getDb();
  const idempotencyKey = uuidv4();

  await database.runAsync(
    `INSERT INTO outbox (id, trip_id, timestamp, latitude, longitude, accuracy, speed, status, attempt_count, idempotency_key, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
    [
      point.id,
      point.trip_id,
      toISO(point.timestamp),
      point.latitude,
      point.longitude,
      point.accuracy,
      point.speed,
      idempotencyKey,
      Date.now(),
    ]
  );
}

/**
 * Enqueue multiple points in a single transaction (batch insert)
 */
export async function enqueuePoints(points: TripPoint[]): Promise<void> {
  if (points.length === 0) return;
  const database = await getDb();

  await database.withTransactionAsync(async () => {
    for (const point of points) {
      const idempotencyKey = uuidv4();
      await database.runAsync(
        `INSERT OR IGNORE INTO outbox (id, trip_id, timestamp, latitude, longitude, accuracy, speed, status, attempt_count, idempotency_key, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
        [
          point.id,
          point.trip_id,
          toISO(point.timestamp),
          point.latitude,
          point.longitude,
          point.accuracy,
          point.speed,
          idempotencyKey,
          Date.now(),
        ]
      );
    }
  });
}

/**
 * Fetch the oldest pending points from the outbox
 */
export async function getPendingPoints(
  limit: number = 10
): Promise<QueuedPoint[]> {
  const database = await getDb();

  const rows = await database.getAllAsync<QueuedPoint>(
    `SELECT * FROM outbox WHERE status = 'pending' ORDER BY created_at ASC LIMIT ?`,
    [limit]
  );

  return rows;
}

/**
 * Mark points as currently syncing (prevents double-processing)
 */
export async function markSyncing(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const database = await getDb();
  const placeholders = ids.map(() => '?').join(',');

  await database.runAsync(
    `UPDATE outbox SET status = 'syncing' WHERE id IN (${placeholders})`,
    ids
  );
}

/**
 * Delete successfully synced points from the outbox
 */
export async function markSynced(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const database = await getDb();
  const placeholders = ids.map(() => '?').join(',');

  await database.runAsync(
    `DELETE FROM outbox WHERE id IN (${placeholders})`,
    ids
  );
}

/**
 * Mark points as failed and increment attempt counter
 */
export async function markFailed(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const database = await getDb();
  const placeholders = ids.map(() => '?').join(',');

  await database.runAsync(
    `UPDATE outbox SET status = 'pending', attempt_count = attempt_count + 1 WHERE id IN (${placeholders})`,
    ids
  );
}

/**
 * Get the count of pending (unsent) points
 */
export async function getPendingCount(): Promise<number> {
  const database = await getDb();

  const result = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM outbox WHERE status IN ('pending', 'syncing')`
  );

  return result?.count ?? 0;
}

/**
 * Clear all entries from the outbox
 */
export async function clearAll(): Promise<void> {
  const database = await getDb();
  await database.runAsync(`DELETE FROM outbox`);
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  pending: number;
  syncing: number;
  failed: number;
}> {
  const database = await getDb();

  const pending = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM outbox WHERE status = 'pending'`
  );
  const syncing = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM outbox WHERE status = 'syncing'`
  );
  const failed = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM outbox WHERE attempt_count >= 3`
  );

  return {
    pending: pending?.count ?? 0,
    syncing: syncing?.count ?? 0,
    failed: failed?.count ?? 0,
  };
}
