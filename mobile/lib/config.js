import { Platform } from 'react-native'

import Constants from 'expo-constants'

/**
 * Spring Boot API base (no trailing slash).
 * Set EXPO_PUBLIC_API_BASE in .env for physical devices (e.g. http://192.168.1.5:8081).
 * Android emulator: 10.0.2.2 maps to host machine localhost.
 */
function defaultBase() {
  const hostUri = Constants?.expoConfig?.hostUri
  if (hostUri) {
    // If running on a physical device over LAN, use the same computer's IP as the backend.
    const ip = hostUri.split(':')[0]
    return `http://${ip}:8081`
  }
  if (Platform.OS === 'android') return 'http://10.0.2.2:8081'
  return 'http://localhost:8081'
}

export const API_BASE = (process.env.EXPO_PUBLIC_API_BASE || defaultBase()).replace(/\/$/, '')

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}
