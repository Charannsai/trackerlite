/**
 * TrackerLite — LocationMarker Component
 * Custom animated marker with pulse effect and heading arrow
 * Engineered for Android/iOS native stability
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
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;

  // Pulse animation (useNativeDriver: false inside Marker prevents Android native view reparenting bugs)
  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 2.2,
            duration: 1600,
            useNativeDriver: false,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: false,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: false,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseScale, pulseOpacity]);

  return (
    <Marker
      key="user-current-marker"
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      flat={true}
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

        {/* Core marker dot */}
        <View style={styles.outerDot}>
          <View style={styles.innerDot} />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryDim,
    borderWidth: 1.5,
    borderColor: Colors.primary,
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
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.primary,
  },
  outerDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
});

export const LocationMarker = React.memo(LocationMarkerComponent);
