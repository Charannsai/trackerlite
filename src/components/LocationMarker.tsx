/**
 * TrackerLite — LocationMarker Component
 * Custom animated marker with pulsing circle effect and heading indicator
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Marker } from 'react-native-maps';
import { Colors } from '@/constants/theme';
import type { Coordinate } from '@/types';

interface LocationMarkerProps {
  coordinate: Pick<Coordinate, 'latitude' | 'longitude'>;
  heading: number | null;
  accuracy: number | null;
}

function LocationMarkerComponent({
  coordinate,
  heading,
  accuracy,
}: LocationMarkerProps) {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  // Ripple pulse animation
  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 2.5,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseScale, pulseOpacity]);

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      flat={true}
      tracksViewChanges={false}
    >
      <View style={styles.markerContainer}>
        {/* Pulse ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />

        {/* Accuracy circle */}
        {accuracy !== null && accuracy > 0 && (
          <View
            style={[
              styles.accuracyCircle,
              {
                width: Math.max(30, Math.min(accuracy * 2, 80)),
                height: Math.max(30, Math.min(accuracy * 2, 80)),
                borderRadius: Math.max(15, Math.min(accuracy, 40)),
              },
            ]}
          />
        )}

        {/* Heading arrow */}
        {heading !== null && heading !== undefined && (
          <View
            style={[
              styles.headingArrow,
              {
                transform: [{ rotate: `${heading}deg` }, { translateY: -14 }],
              },
            ]}
          >
            <View style={styles.arrowShape} />
          </View>
        )}

        {/* Core dot */}
        <View style={styles.outerDot}>
          <View style={styles.innerDot} />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  accuracyCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
  },
  headingArrow: {
    position: 'absolute',
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowShape: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.primary,
  },
  outerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});

export const LocationMarker = React.memo(LocationMarkerComponent);
