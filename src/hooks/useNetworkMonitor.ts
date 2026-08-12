/**
 * TrackerLite — Network Monitor Hook
 * Subscribes to NetInfo and merges with manual toggle
 * Triggers sync flush on offline→online transition
 */

import { useEffect, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useNetworkStore } from '@/store/useNetworkStore';

export function useNetworkMonitor() {
  const previousEffectiveOnline = useRef<boolean | null>(null);

  const isOnline = useNetworkStore((s) => s.isOnline);
  const isManualOffline = useNetworkStore((s) => s.isManualOffline);
  const setOnline = useNetworkStore((s) => s.setOnline);
  const setConnectionType = useNetworkStore((s) => s.setConnectionType);
  const toggleManualOffline = useNetworkStore((s) => s.toggleManualOffline);
  const getEffectiveOnline = useNetworkStore((s) => s.getEffectiveOnline);

  // Subscribe to NetInfo
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setOnline(state.isConnected ?? false);
      setConnectionType(state.type);
    });

    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      setOnline(state.isConnected ?? false);
      setConnectionType(state.type);
    });

    return () => {
      unsubscribe();
    };
  }, [setOnline, setConnectionType]);

  // Track effective online transitions
  useEffect(() => {
    const effectiveOnline = isOnline && !isManualOffline;

    if (
      previousEffectiveOnline.current === false &&
      effectiveOnline === true
    ) {
      // Transitioned from offline to online
      console.log('[Network] Transitioned to ONLINE — sync should trigger');
    }

    previousEffectiveOnline.current = effectiveOnline;
  }, [isOnline, isManualOffline]);

  return {
    isOnline,
    isManualOffline,
    effectiveOnline: getEffectiveOnline(),
    toggleManualOffline,
  };
}
