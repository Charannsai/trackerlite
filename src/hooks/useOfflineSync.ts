/**
 * TrackerLite — Offline Sync Hook
 * Watches network state and triggers batch sync on reconnection
 * Updates queue count in store during flush
 */

import { useEffect, useRef, useCallback } from 'react';
import { useNetworkStore } from '@/store/useNetworkStore';
import * as syncService from '@/services/syncService';
import * as dbService from '@/services/dbService';
import type { SyncProgress } from '@/types';

export function useOfflineSync() {
  const wasOfflineRef = useRef(false);

  const isOnline = useNetworkStore((s) => s.isOnline);
  const isManualOffline = useNetworkStore((s) => s.isManualOffline);
  const isSyncing = useNetworkStore((s) => s.isSyncing);
  const pendingCount = useNetworkStore((s) => s.pendingCount);
  const updatePendingCount = useNetworkStore((s) => s.updatePendingCount);
  const setSyncing = useNetworkStore((s) => s.setSyncing);
  const setLastSyncResult = useNetworkStore((s) => s.setLastSyncResult);

  const effectiveOnline = isOnline && !isManualOffline;

  /**
   * Trigger a manual or automatic sync flush
   */
  const triggerSync = useCallback(async () => {
    if (syncService.isSyncing()) return;
    if (!effectiveOnline) return;

    const count = await dbService.getPendingCount();
    if (count === 0) return;

    setSyncing(true);

    try {
      const result = await syncService.flushQueue(
        (progress: SyncProgress) => {
          updatePendingCount(progress.totalPending);
        }
      );

      const message = `Synced ${result.synced} pts${result.failed > 0 ? `, ${result.failed} failed` : ''}`;
      setLastSyncResult(message);
    } catch (error) {
      setLastSyncResult('Sync failed');
      console.error('[Sync] Flush error:', error);
    } finally {
      setSyncing(false);
      const finalCount = await dbService.getPendingCount();
      updatePendingCount(finalCount);
    }
  }, [effectiveOnline, setSyncing, updatePendingCount, setLastSyncResult]);

  // Auto-sync on offline→online transition
  useEffect(() => {
    if (!effectiveOnline) {
      wasOfflineRef.current = true;
    } else if (wasOfflineRef.current && effectiveOnline) {
      // Just came back online
      wasOfflineRef.current = false;
      console.log('[Sync] Back online — auto-flushing queue');
      triggerSync();
    }
  }, [effectiveOnline, triggerSync]);

  // Periodically update pending count
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const count = await dbService.getPendingCount();
        updatePendingCount(count);
      } catch {
        // Database may not be initialized yet
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [updatePendingCount]);

  return {
    isSyncing,
    pendingCount,
    triggerSync,
  };
}
