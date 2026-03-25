/**
 * Map view settings — adjust center, zoom, and tiles here without touching map logic.
 */
export const MAP_CONFIG = {
  defaultCenter: [28.6139, 77.2090],
  defaultZoom: 13,
  flyToZoom: 15,
  flyDuration: 1.2,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution: '© OpenStreetMap contributors',
  regionLabel: 'Delhi NCR',
  circleRadius: { selected: 300, default: 180 },
}
