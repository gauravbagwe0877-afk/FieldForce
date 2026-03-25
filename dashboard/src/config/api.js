/**
 * API origin for the Spring Boot backend. Empty string uses the Vite dev proxy (/api → localhost:8081).
 * For production builds set VITE_API_BASE (e.g. https://api.example.com).
 */
export const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}
