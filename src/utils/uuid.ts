import * as Crypto from 'expo-crypto';

/**
 * Robust UUID v4 generator for React Native / Expo.
 * Uses native expo-crypto with an RFC4122 compliant fallback.
 */
export function uuidv4(): string {
  try {
    if (Crypto && typeof Crypto.randomUUID === 'function') {
      return Crypto.randomUUID();
    }
  } catch {
    // Fallback if Crypto native module isn't ready
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
