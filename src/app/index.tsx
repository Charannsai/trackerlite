/**
 * TrackerLite — Main Map Tracking Screen
 * Composes all components: StatusBar, MapDisplay, TripInfoBar, ControlPanel
 * Initializes hooks for location tracking, network monitoring, and offline sync
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { StatusBar } from '@/components/StatusBar';
import { MapDisplay } from '@/components/MapDisplay';
import { TripInfoBar } from '@/components/TripInfoBar';
import { ControlPanel } from '@/components/ControlPanel';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useNetworkMonitor } from '@/hooks/useNetworkMonitor';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useTripStore } from '@/store/useTripStore';

export default function MapScreen() {
  // Initialize hooks
  const {
    isTracking,
    mode,
    startTrip,
    stopTrip,
    setMode,
  } = useLocationTracking();

  const {
    effectiveOnline,
    isManualOffline,
    toggleManualOffline,
  } = useNetworkMonitor();

  const {
    isSyncing,
    pendingCount,
    triggerSync,
  } = useOfflineSync();

  // Subscribe to trip store for stats
  const coordinates = useTripStore((s) => s.coordinates);
  const elapsedTime = useTripStore((s) => s.elapsedTime);
  const currentSpeed = useTripStore((s) => s.currentSpeed);
  const totalDistance = useTripStore((s) => s.totalDistance);

  return (
    <View style={styles.container}>
      {/* Full-screen Map */}
      <View style={styles.mapContainer}>
        <MapDisplay
          coordinates={coordinates}
          isTracking={isTracking}
        />
      </View>

      {/* Overlay: Status Bar */}
      <StatusBar
        effectiveOnline={effectiveOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
      />

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {/* Trip Info */}
        <TripInfoBar
          elapsedTime={elapsedTime}
          currentSpeed={currentSpeed}
          totalDistance={totalDistance}
          mode={mode}
          isTracking={isTracking}
        />

        {/* Controls */}
        <ControlPanel
          isTracking={isTracking}
          mode={mode}
          isManualOffline={isManualOffline}
          isSyncing={isSyncing}
          pendingCount={pendingCount}
          onStartTrip={startTrip}
          onStopTrip={stopTrip}
          onToggleMode={setMode}
          onToggleOffline={toggleManualOffline}
          onSync={triggerSync}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 1,
  },
  bottomPanel: {
    backgroundColor: Colors.background,
  },
});
