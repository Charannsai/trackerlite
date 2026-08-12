/**
 * TrackerLite — MapDisplay Component
 * Memoized MapView with dynamic polyline rendering
 * Re-renders only the path when new coordinates arrive
 */

import React, { useMemo, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors, DarkMapStyle, BorderRadius, Spacing } from '@/constants/theme';
import { LocationMarker } from './LocationMarker';
import { fitBoundsRegion } from '@/utils/geometry';
import type { TripPoint, MapRegion } from '@/types';

interface MapDisplayProps {
  coordinates: TripPoint[];
  isTracking: boolean;
}

/** Gradient polyline — renders segments with fading opacity */
const GradientPolyline = React.memo(
  ({ coordinates }: { coordinates: TripPoint[] }) => {
    const segments = useMemo(() => {
      if (coordinates.length < 2) return [];

      const totalPoints = coordinates.length;
      const segmentSize = Math.max(1, Math.floor(totalPoints / 5));
      const result: {
        coords: { latitude: number; longitude: number }[];
        opacity: number;
      }[] = [];

      for (let i = 0; i < totalPoints - 1; i += segmentSize) {
        const end = Math.min(i + segmentSize + 1, totalPoints);
        const segmentCoords = coordinates.slice(i, end).map((c) => ({
          latitude: c.latitude,
          longitude: c.longitude,
        }));

        const opacity = 0.2 + (i / totalPoints) * 0.8;

        if (segmentCoords.length >= 2) {
          result.push({ coords: segmentCoords, opacity });
        }
      }

      return result;
    }, [coordinates]);

    return (
      <>
        {segments.map((segment, idx) => (
          <Polyline
            key={`poly-${idx}`}
            coordinates={segment.coords}
            strokeColor={`rgba(0, 229, 255, ${segment.opacity})`}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        ))}
        {/* Full trail with lower opacity as base */}
        {coordinates.length >= 2 && (
          <Polyline
            coordinates={coordinates.map((c) => ({
              latitude: c.latitude,
              longitude: c.longitude,
            }))}
            strokeColor="rgba(0, 229, 255, 0.15)"
            strokeWidth={6}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </>
    );
  }
);

function MapDisplayComponent({ coordinates, isTracking }: MapDisplayProps) {
  const mapRef = useRef<MapView>(null);

  // Current position (last coordinate)
  const currentPosition = useMemo(() => {
    if (coordinates.length === 0) return null;
    return coordinates[coordinates.length - 1];
  }, [coordinates]);

  // Initial region — Hyderabad (Hitech City start point)
  const initialRegion: MapRegion = useMemo(
    () => ({
      latitude: 17.4484,
      longitude: 78.3801,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }),
    []
  );

  // Follow current position
  React.useEffect(() => {
    if (currentPosition && mapRef.current && isTracking) {
      mapRef.current.animateToRegion(
        {
          latitude: currentPosition.latitude,
          longitude: currentPosition.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        500
      );
    }
  }, [currentPosition, isTracking]);

  // Fit to bounds handler
  const handleFitBounds = useCallback(() => {
    if (coordinates.length === 0 || !mapRef.current) return;

    const region = fitBoundsRegion(coordinates);
    mapRef.current.animateToRegion(region, 800);
  }, [coordinates]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={DarkMapStyle}
        userInterfaceStyle="dark"
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation={false}
        rotateEnabled={false}
        pitchEnabled={false}
        moveOnMarkerPress={false}
        toolbarEnabled={false}
      >
        {/* Trail polyline with gradient effect */}
        <GradientPolyline coordinates={coordinates} />

        {/* Current position marker */}
        {currentPosition && (
          <LocationMarker
            coordinate={{
              latitude: currentPosition.latitude,
              longitude: currentPosition.longitude,
            }}
            heading={currentPosition.heading}
            accuracy={currentPosition.accuracy}
          />
        )}
      </MapView>

      {/* Fit to bounds FAB */}
      {coordinates.length > 1 && (
        <TouchableOpacity
          style={styles.fitBoundsButton}
          onPress={handleFitBounds}
          activeOpacity={0.7}
        >
          <Text style={styles.fitBoundsIcon}>⊡</Text>
        </TouchableOpacity>
      )}

      {/* Point counter overlay */}
      {isTracking && (
        <View style={styles.pointCounter}>
          <Text style={styles.pointCountText}>
            {coordinates.length} pts
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fitBoundsButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  fitBoundsIcon: {
    fontSize: 20,
    color: Colors.primary,
  },
  pointCounter: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pointCountText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});

export const MapDisplay = React.memo(MapDisplayComponent);
