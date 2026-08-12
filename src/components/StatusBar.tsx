/**
 * TrackerLite — StatusBar Component
 * Sticky top bar showing network status and queue count
 * Features glassmorphism, animated status indicator, and pulse effects
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { formatQueueCount } from '@/utils/formatters';

interface StatusBarProps {
  effectiveOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
}

function StatusBarComponent({
  effectiveOnline,
  pendingCount,
  isSyncing,
}: StatusBarProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const syncRotation = useRef(new Animated.Value(0)).current;

  // Pulsing dot animation for offline state
  useEffect(() => {
    if (!effectiveOnline) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [effectiveOnline, pulseAnim]);

  // Sync spinner
  useEffect(() => {
    if (isSyncing) {
      const spin = Animated.loop(
        Animated.timing(syncRotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    } else {
      syncRotation.setValue(0);
    }
  }, [isSyncing, syncRotation]);

  const statusColor = effectiveOnline ? Colors.online : Colors.offline;
  const statusText = effectiveOnline ? 'ONLINE' : 'OFFLINE';

  const spinInterpolation = syncRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.blurContainer}>
        <View style={styles.content}>
          {/* Network Status */}
          <View style={styles.statusSection}>
            <Animated.View
              style={[
                styles.statusDot,
                {
                  backgroundColor: statusColor,
                  opacity: pulseAnim,
                },
              ]}
            />
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: effectiveOnline
                    ? Colors.onlineDim
                    : Colors.offlineDim,
                  borderColor: statusColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: statusColor },
                ]}
              >
                {statusText}
              </Text>
            </View>
          </View>

          {/* Queue Count */}
          <View style={styles.queueSection}>
            {isSyncing && (
              <Animated.Text
                style={[
                  styles.syncIcon,
                  { transform: [{ rotate: spinInterpolation }] },
                ]}
              >
                ⟳
              </Animated.Text>
            )}
            {pendingCount > 0 && (
              <View style={styles.queueBadge}>
                <Text style={styles.queueIcon}>⏳</Text>
                <Text style={styles.queueText}>
                  {formatQueueCount(pendingCount)}
                </Text>
              </View>
            )}
            {pendingCount === 0 && !isSyncing && (
              <Text style={styles.queueEmptyText}>✓ All synced</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  blurContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
  },
  statusText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  queueSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  syncIcon: {
    fontSize: 16,
    color: Colors.primary,
  },
  queueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warningDim,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  queueIcon: {
    fontSize: 12,
  },
  queueText: {
    fontSize: Typography.sizes.sm,
    color: Colors.warning,
    fontWeight: '600',
  },
  queueEmptyText: {
    fontSize: Typography.sizes.sm,
    color: Colors.online,
    fontWeight: '500',
  },
});

export const StatusBar = React.memo(StatusBarComponent);
