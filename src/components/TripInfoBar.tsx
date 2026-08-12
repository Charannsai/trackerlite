/**
 * TrackerLite — TripInfoBar Component
 * Glassmorphic stats panel showing duration, speed, and distance
 * Features animated value transitions and mode indicator
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '@/constants/theme';
import { formatDuration, formatSpeed, formatDistance } from '@/utils/formatters';
import type { TrackingMode } from '@/types';

interface TripInfoBarProps {
  elapsedTime: number;
  currentSpeed: number;
  totalDistance: number;
  mode: TrackingMode;
  isTracking: boolean;
}

function TripInfoBarComponent({
  elapsedTime,
  currentSpeed,
  totalDistance,
  mode,
  isTracking,
}: TripInfoBarProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isTracking ? 1 : 0.5,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isTracking, fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        {/* Duration */}
        <View style={styles.statColumn}>
          <Text style={styles.statIcon}>⏱</Text>
          <Text style={styles.statValue}>{formatDuration(elapsedTime)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Speed */}
        <View style={styles.statColumn}>
          <Text style={styles.statIcon}>🏎</Text>
          <Text style={styles.statValue}>{formatSpeed(currentSpeed)}</Text>
          <Text style={styles.statLabel}>Speed</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Distance */}
        <View style={styles.statColumn}>
          <Text style={styles.statIcon}>📏</Text>
          <Text style={styles.statValue}>{formatDistance(totalDistance)}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
      </View>

      {/* Mode Indicator */}
      <View style={styles.modeRow}>
        <View
          style={[
            styles.modeBadge,
            {
              backgroundColor:
                mode === 'real' ? Colors.onlineDim : Colors.primaryDim,
              borderColor: mode === 'real' ? Colors.online : Colors.primary,
            },
          ]}
        >
          <Text style={styles.modeIcon}>
            {mode === 'real' ? '📡' : '🎮'}
          </Text>
          <Text
            style={[
              styles.modeText,
              {
                color: mode === 'real' ? Colors.online : Colors.primary,
              },
            ]}
          >
            {mode === 'real' ? 'Real GPS' : 'Simulated'}
          </Text>
        </View>

        {isTracking && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.card,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  statValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
  },
  modeIcon: {
    fontSize: 12,
  },
  modeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.offline,
  },
  liveText: {
    fontSize: Typography.sizes.xs,
    color: Colors.offline,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});

export const TripInfoBar = React.memo(TripInfoBarComponent);
