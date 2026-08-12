/**
 * TrackerLite — Simulation Route Data
 * A realistic route through Hyderabad: Hitech City → Gachibowli → IKEA → ORR
 * ~80 waypoints covering approx 12 km
 */

import { RouteWaypoint } from '@/types';

/** Hyderabad simulation route */
export const HYDERABAD_ROUTE: RouteWaypoint[] = [
  // Start: Hitech City Metro Station
  { latitude: 17.4484, longitude: 78.3801, speedHint: 0 },
  { latitude: 17.4479, longitude: 78.3810, speedHint: 5 },
  { latitude: 17.4472, longitude: 78.3822, speedHint: 8 },
  { latitude: 17.4465, longitude: 78.3838, speedHint: 11 },
  // Moving towards Cyber Towers
  { latitude: 17.4460, longitude: 78.3855, speedHint: 13 },
  { latitude: 17.4452, longitude: 78.3870, speedHint: 14 },
  { latitude: 17.4445, longitude: 78.3885, speedHint: 12 },
  { latitude: 17.4438, longitude: 78.3898, speedHint: 10 },
  // Turning towards Gachibowli
  { latitude: 17.4425, longitude: 78.3908, speedHint: 11 },
  { latitude: 17.4412, longitude: 78.3920, speedHint: 13 },
  { latitude: 17.4398, longitude: 78.3932, speedHint: 15 },
  { latitude: 17.4385, longitude: 78.3945, speedHint: 14 },
  { latitude: 17.4370, longitude: 78.3955, speedHint: 16 },
  // ISB Road stretch — faster
  { latitude: 17.4355, longitude: 78.3968, speedHint: 18 },
  { latitude: 17.4340, longitude: 78.3980, speedHint: 20 },
  { latitude: 17.4322, longitude: 78.3992, speedHint: 22 },
  { latitude: 17.4305, longitude: 78.4005, speedHint: 20 },
  { latitude: 17.4290, longitude: 78.4018, speedHint: 18 },
  // Gachibowli Junction — slowing down
  { latitude: 17.4275, longitude: 78.4030, speedHint: 12 },
  { latitude: 17.4262, longitude: 78.4038, speedHint: 8 },
  { latitude: 17.4248, longitude: 78.4042, speedHint: 5 },
  { latitude: 17.4238, longitude: 78.4048, speedHint: 6 },
  // Towards Biodiversity Junction
  { latitude: 17.4225, longitude: 78.4058, speedHint: 10 },
  { latitude: 17.4210, longitude: 78.4070, speedHint: 14 },
  { latitude: 17.4195, longitude: 78.4082, speedHint: 16 },
  { latitude: 17.4180, longitude: 78.4095, speedHint: 18 },
  { latitude: 17.4165, longitude: 78.4108, speedHint: 20 },
  { latitude: 17.4150, longitude: 78.4120, speedHint: 22 },
  // ORR Entry — highway speeds
  { latitude: 17.4132, longitude: 78.4135, speedHint: 25 },
  { latitude: 17.4115, longitude: 78.4150, speedHint: 28 },
  { latitude: 17.4098, longitude: 78.4168, speedHint: 30 },
  { latitude: 17.4080, longitude: 78.4185, speedHint: 30 },
  { latitude: 17.4062, longitude: 78.4202, speedHint: 28 },
  { latitude: 17.4045, longitude: 78.4220, speedHint: 30 },
  { latitude: 17.4028, longitude: 78.4238, speedHint: 30 },
  { latitude: 17.4010, longitude: 78.4255, speedHint: 28 },
  // Curve on ORR
  { latitude: 17.3995, longitude: 78.4270, speedHint: 22 },
  { latitude: 17.3980, longitude: 78.4288, speedHint: 20 },
  { latitude: 17.3968, longitude: 78.4305, speedHint: 22 },
  { latitude: 17.3955, longitude: 78.4322, speedHint: 25 },
  // Towards IKEA Hyderabad
  { latitude: 17.3942, longitude: 78.4340, speedHint: 28 },
  { latitude: 17.3928, longitude: 78.4358, speedHint: 26 },
  { latitude: 17.3915, longitude: 78.4375, speedHint: 24 },
  { latitude: 17.3902, longitude: 78.4392, speedHint: 20 },
  { latitude: 17.3890, longitude: 78.4408, speedHint: 16 },
  // IKEA approach — slowing
  { latitude: 17.3878, longitude: 78.4420, speedHint: 12 },
  { latitude: 17.3868, longitude: 78.4430, speedHint: 8 },
  { latitude: 17.3858, longitude: 78.4438, speedHint: 5 },
  // Post IKEA — resuming on ORR
  { latitude: 17.3848, longitude: 78.4448, speedHint: 10 },
  { latitude: 17.3835, longitude: 78.4462, speedHint: 16 },
  { latitude: 17.3820, longitude: 78.4478, speedHint: 22 },
  { latitude: 17.3805, longitude: 78.4495, speedHint: 26 },
  { latitude: 17.3790, longitude: 78.4512, speedHint: 28 },
  { latitude: 17.3775, longitude: 78.4530, speedHint: 30 },
  { latitude: 17.3760, longitude: 78.4548, speedHint: 28 },
  { latitude: 17.3745, longitude: 78.4565, speedHint: 26 },
  // Exit ramp
  { latitude: 17.3732, longitude: 78.4580, speedHint: 20 },
  { latitude: 17.3720, longitude: 78.4592, speedHint: 16 },
  { latitude: 17.3710, longitude: 78.4602, speedHint: 12 },
  { latitude: 17.3700, longitude: 78.4610, speedHint: 8 },
  // Final stretch — city roads
  { latitude: 17.3692, longitude: 78.4618, speedHint: 10 },
  { latitude: 17.3685, longitude: 78.4628, speedHint: 12 },
  { latitude: 17.3678, longitude: 78.4638, speedHint: 14 },
  { latitude: 17.3670, longitude: 78.4648, speedHint: 12 },
  { latitude: 17.3662, longitude: 78.4658, speedHint: 10 },
  { latitude: 17.3655, longitude: 78.4665, speedHint: 8 },
  // Destination — Rajiv Gandhi International Convention Center area
  { latitude: 17.3648, longitude: 78.4672, speedHint: 5 },
  { latitude: 17.3642, longitude: 78.4678, speedHint: 3 },
  { latitude: 17.3638, longitude: 78.4682, speedHint: 0 },
];

/** Default simulation speed multiplier */
export const DEFAULT_SIMULATION_SPEED = 1.0;

/** Interval between simulated coordinate emissions (ms) */
export const SIMULATION_INTERVAL_MS = 1000;

/** API configuration */
export const API_CONFIG = {
  baseUrl: 'http://192.168.29.148:3001', // Local LAN server IP (works on physical devices & emulators)
  syncEndpoint: '/api/sync',
  healthEndpoint: '/api/health',
  batchSize: 10,
  timeoutMs: 5000,
  maxRetries: 3,
} as const;

/** Location tracking config */
export const LOCATION_CONFIG = {
  /** Minimum time between updates in ms */
  minInterval: 1000,
  /** Distance filter in meters */
  distanceFilter: 5,
  /** Speed threshold (m/s) below which we reduce update frequency */
  stationarySpeedThreshold: 0.5,
  /** Update interval when stationary (ms) */
  stationaryInterval: 5000,
} as const;
