/**
 * TrackerLite — Network Store (Zustand)
 * Manages network status, manual offline toggle, queue count, and sync state
 */

import { create } from 'zustand';

interface NetworkState {
  // Network status
  isOnline: boolean;
  isManualOffline: boolean;
  connectionType: string | null;

  // Queue state
  pendingCount: number;

  // Sync state
  isSyncing: boolean;
  lastSyncTime: number | null;
  lastSyncResult: string | null;

  // Derived getter — call as computed
  getEffectiveOnline: () => boolean;

  // Actions
  setOnline: (isOnline: boolean) => void;
  setConnectionType: (type: string | null) => void;
  toggleManualOffline: () => void;
  setManualOffline: (value: boolean) => void;
  updatePendingCount: (count: number) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncResult: (result: string) => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isOnline: true,
  isManualOffline: false,
  connectionType: null,
  pendingCount: 0,
  isSyncing: false,
  lastSyncTime: null,
  lastSyncResult: null,

  getEffectiveOnline: () => {
    const state = get();
    return state.isOnline && !state.isManualOffline;
  },

  setOnline: (isOnline: boolean) => set({ isOnline }),

  setConnectionType: (type: string | null) => set({ connectionType: type }),

  toggleManualOffline: () =>
    set((state) => ({ isManualOffline: !state.isManualOffline })),

  setManualOffline: (value: boolean) => set({ isManualOffline: value }),

  updatePendingCount: (count: number) => set({ pendingCount: count }),

  setSyncing: (syncing: boolean) =>
    set({
      isSyncing: syncing,
      ...(syncing ? {} : { lastSyncTime: Date.now() }),
    }),

  setLastSyncResult: (result: string) => set({ lastSyncResult: result }),
}));
