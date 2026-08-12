/**
 * TrackerLite — MapDisplay Component
 * High-performance memoized MapView with real-time polyline rendering
 * Optimized for 60fps and 100% Android/iOS native view stability
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

function MapDisplayComponent({ coordinates, isTracking }: MapDisplayProps) {
  const mapRef = useRef<MapView>(null);

  // Current position (last coordinate)
  const currentPosition = useMemo(() => {
    if (coordinates.length === 0) return null;
    return coordinates[coordinates.length - 1];
  }, [coordinates]);

  // Coordinates formatted for Polyline
  const polylineCoords = useMemo(() => {
    return coordinates.map((c) => ({
      latitude: c.latitude,
      longitude: c.longitude,
    }));
  }, [coordinates]);

  // Initial region — Hyderabad center (Hitech City)
  const initialRegion: MapRegion = useMemo(
    () => ({
      latitude: 17.4484,
      longitude: 78.3801,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }),
    []
  );

  // Follow current position with smooth camera animation
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
        {/* Outer glow polyline */}
        {polylineCoords.length >= 2 && (
          <Polyline
            key="trail-glow"
            coordinates={polylineCoords}
            strokeColor="rgba(0, 229, 255, 0.25)"
            strokeWidth={8}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Main active polyline */}
        {polylineCoords.length >= 2 && (
          <Polyline
            key="trail-main"
            coordinates={polylineCoords}
            strokeColor={Colors.primary}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Current position marker */}
        {currentPosition && (
          <LocationMarker
            key="active-location-marker"
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
    ...StyleSheet.absoluteFill,
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
