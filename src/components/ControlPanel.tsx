/**
 * TrackerLite — ControlPanel Component
 * Bottom action panel with Start/Stop, Offline toggle, and Sync buttons
 * Features haptic feedback, glow effects, and animated state transitions
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '@/constants/theme';
import type { TrackingMode } from '@/types';

interface ControlPanelProps {
  isTracking: boolean;
  mode: TrackingMode;
  isManualOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  onStartTrip: (mode: TrackingMode) => void;
  onStopTrip: () => void;
  onToggleMode: (mode: TrackingMode) => void;
  onToggleOffline: () => void;
  onSync: () => void;
}

function ControlPanelComponent({
  isTracking,
  mode,
  isManualOffline,
  isSyncing,
  pendingCount,
  onStartTrip,
  onStopTrip,
  onToggleMode,
  onToggleOffline,
  onSync,
}: ControlPanelProps) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Glow animation when tracking
  useEffect(() => {
    if (isTracking) {
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      );
      glow.start();
      return () => glow.stop();
    } else {
      glowAnim.setValue(0);
    }
  }, [isTracking, glowAnim]);

  const handleStartStop = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isTracking) {
      onStopTrip();
    } else {
      onStartTrip(mode);
    }
  };

  const handleToggleOffline = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleOffline();
  };

  const handleSync = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    }
    onSync();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      {/* Mode Toggle */}
      <View style={styles.modeToggleRow}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'real' && styles.modeButtonActive,
          ]}
          onPress={() => !isTracking && onToggleMode('real')}
          disabled={isTracking}
          activeOpacity={0.7}
        >
          <Text style={styles.modeButtonIcon}>📡</Text>
          <Text
            style={[
              styles.modeButtonText,
              mode === 'real' && styles.modeButtonTextActive,
              isTracking && styles.disabledText,
            ]}
          >
            Real GPS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'simulated' && styles.modeButtonActive,
          ]}
          onPress={() => !isTracking && onToggleMode('simulated')}
          disabled={isTracking}
          activeOpacity={0.7}
        >
          <Text style={styles.modeButtonIcon}>🎮</Text>
          <Text
            style={[
              styles.modeButtonText,
              mode === 'simulated' && styles.modeButtonTextActive,
              isTracking && styles.disabledText,
            ]}
          >
            Simulated
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Controls Row */}
      <View style={styles.controlsRow}>
        {/* Force Offline Toggle */}
        <View style={styles.offlineControl}>
          <Text style={styles.offlineLabel}>Force Offline</Text>
          <Switch
            value={isManualOffline}
            onValueChange={handleToggleOffline}
            trackColor={{
              false: Colors.surfaceLight,
              true: Colors.warningDim,
            }}
            thumbColor={isManualOffline ? Colors.warning : Colors.textSecondary}
            ios_backgroundColor={Colors.surfaceLight}
          />
        </View>

        {/* Start / Stop Button */}
        <TouchableOpacity
          style={[
            styles.mainButton,
            isTracking ? styles.stopButton : styles.startButton,
          ]}
          onPress={handleStartStop}
          activeOpacity={0.8}
        >
          {isTracking && (
            <Animated.View
              style={[
                styles.buttonGlow,
                {
                  opacity: glowOpacity,
                  backgroundColor: Colors.offline,
                },
              ]}
            />
          )}
          <Text style={styles.mainButtonIcon}>
            {isTracking ? '⏹' : '▶'}
          </Text>
          <Text style={styles.mainButtonText}>
            {isTracking ? 'Stop' : 'Start'}
          </Text>
        </TouchableOpacity>

        {/* Sync Button */}
        <TouchableOpacity
          style={[
            styles.syncButton,
            (pendingCount === 0 || isSyncing) && styles.syncButtonDisabled,
          ]}
          onPress={handleSync}
          disabled={pendingCount === 0 || isSyncing}
          activeOpacity={0.7}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.syncIcon}>⟳</Text>
          )}
          <Text
            style={[
              styles.syncText,
              (pendingCount === 0 || isSyncing) && styles.syncTextDisabled,
            ]}
          >
            Sync
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xxxl : Spacing.xl,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeButtonActive: {
    backgroundColor: Colors.primaryDim,
    borderColor: Colors.primary,
  },
  modeButtonIcon: {
    fontSize: 14,
  },
  modeButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: Colors.primary,
  },
  disabledText: {
    opacity: 0.4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  offlineControl: {
    alignItems: 'center',
    gap: 4,
  },
  offlineLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  mainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  startButton: {
    backgroundColor: Colors.secondaryDim,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    ...Shadows.glow(Colors.secondary),
  },
  stopButton: {
    backgroundColor: Colors.offlineDim,
    borderWidth: 1.5,
    borderColor: Colors.offline,
    ...Shadows.glow(Colors.offline),
  },
  buttonGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.lg,
  },
  mainButtonIcon: {
    fontSize: 18,
    color: Colors.textPrimary,
  },
  mainButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  syncButton: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  syncButtonDisabled: {
    borderColor: Colors.border,
    opacity: 0.4,
  },
  syncIcon: {
    fontSize: 20,
    color: Colors.primary,
  },
  syncText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  syncTextDisabled: {
    color: Colors.textMuted,
  },
});

export const ControlPanel = React.memo(ControlPanelComponent);
