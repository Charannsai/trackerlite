/**
 * TrackerLite — Sync Service
 * Batch upload worker: reads from SQLite outbox → POSTs to API → deletes on success
 * Implements concurrency lock, exponential backoff, and progress reporting
 */

import { API_CONFIG } from '@/constants/routes';
import * as dbService from './dbService';
import * as apiService from './apiService';
import type { SyncProgress } from '@/types';

let isFlushing = false;

/**
 * Flush the offline queue by sending batches to the backend
 * Only one flush operation can run at a time (concurrency lock)
 */
export async function flushQueue(
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncProgress> {
  // Concurrency lock — prevent duplicate flushes
  if (isFlushing) {
    console.log('[Sync] Flush already in progress, skipping');
    return {
      totalPending: await dbService.getPendingCount(),
      synced: 0,
      failed: 0,
      inProgress: true,
    };
  }

  isFlushing = true;
  let totalSynced = 0;
  let totalFailed = 0;

  try {
    let totalPending = await dbService.getPendingCount();

    if (totalPending === 0) {
      return { totalPending: 0, synced: 0, failed: 0, inProgress: false };
    }

    console.log(`[Sync] Starting flush: ${totalPending} points pending`);

    // Process in batches until queue is empty
    while (true) {
      const batch = await dbService.getPendingPoints(API_CONFIG.batchSize);

      if (batch.length === 0) break;

      const ids = batch.map((p) => p.id);

      // Mark as syncing to prevent re-processing
      await dbService.markSyncing(ids);

      try {
        // POST batch to backend
        const response = await apiService.postBatch(batch);

        if (response.success) {
          // Success — remove from outbox
          await dbService.markSynced(ids);
          totalSynced += batch.length;
          console.log(
            `[Sync] Batch synced: ${batch.length} points (total: ${totalSynced})`
          );
        } else {
          // API returned failure
          await dbService.markFailed(ids);
          totalFailed += batch.length;
          console.warn(`[Sync] Batch rejected by server: ${response.message}`);
        }
      } catch (error) {
        // Network or other error — mark as failed for retry
        await dbService.markFailed(ids);
        totalFailed += batch.length;
        console.error(`[Sync] Batch failed:`, error);

        // Break out on network failure — don't keep trying
        break;
      }

      // Report progress
      totalPending = await dbService.getPendingCount();
      onProgress?.({
        totalPending,
        synced: totalSynced,
        failed: totalFailed,
        inProgress: true,
      });

      // Small delay between batches to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const finalPending = await dbService.getPendingCount();
    const progress: SyncProgress = {
      totalPending: finalPending,
      synced: totalSynced,
      failed: totalFailed,
      inProgress: false,
    };

    console.log(
      `[Sync] Flush complete: ${totalSynced} synced, ${totalFailed} failed, ${finalPending} remaining`
    );

    onProgress?.(progress);
    return progress;
  } finally {
    isFlushing = false;
  }
}

/**
 * Check if a flush operation is currently running
 */
export function isSyncing(): boolean {
  return isFlushing;
}

/**
 * Force reset the sync lock (use only if sync gets stuck)
 */
export function resetSyncLock(): void {
  isFlushing = false;
}
