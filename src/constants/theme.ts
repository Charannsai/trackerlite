/**
 * TrackerLite — Design System Tokens
 * Dark premium theme with neon accents and glassmorphism
 */

export const Colors = {
  // Backgrounds
  background: '#0A0E1A',
  backgroundElevated: '#111827',
  surface: 'rgba(20, 30, 55, 0.85)',
  surfaceLight: 'rgba(30, 44, 75, 0.6)',

  // Primary accent — Electric Cyan
  primary: '#00E5FF',
  primaryDim: 'rgba(0, 229, 255, 0.3)',
  primaryGlow: 'rgba(0, 229, 255, 0.15)',

  // Secondary accent — Neon Green
  secondary: '#76FF03',
  secondaryDim: 'rgba(118, 255, 3, 0.3)',
  secondaryGlow: 'rgba(118, 255, 3, 0.15)',

  // Status colors
  online: '#00E676',
  onlineDim: 'rgba(0, 230, 118, 0.2)',
  offline: '#FF1744',
  offlineDim: 'rgba(255, 23, 68, 0.2)',
  warning: '#FF6D00',
  warningDim: 'rgba(255, 109, 0, 0.2)',

  // Text
  textPrimary: '#E8EAED',
  textSecondary: '#9AA0B0',
  textMuted: '#5A6078',

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  mapOverlay: 'rgba(10, 14, 26, 0.4)',
} as const;

export const Typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
    hero: 36,
  },
  lineHeights: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  round: 999,
} as const;

export const Shadows = {
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  }),
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
} as const;

/** Google Maps dark mode style JSON */
export const DarkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6e7681' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8b949e' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6e7681' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0d2818' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d8b5f' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#161b22' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#21262d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1c2330' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#21262d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6e7681' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#161b22' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6e7681' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0a1929' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#2f5d8a' }],
  },
];

/** Polyline gradient colors (oldest → newest) */
export const PolylineGradient = [
  'rgba(0, 229, 255, 0.2)',
  'rgba(0, 229, 255, 0.4)',
  'rgba(0, 229, 255, 0.6)',
  'rgba(0, 229, 255, 0.8)',
  '#00E5FF',
] as const;
