import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import SimFab from './SimFab'
import { MAP_CONFIG } from '../config/mapConfig'

// Fix default leaflet icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createWorkerIcon(worker, isSelected) {
  const colorMap = {
    active: '#22c55e',
    inactive: '#f59e0b',
    alert: '#ef4444',
  }
  const color = colorMap[worker.status] || '#5b8cc9'
  const size = isSelected ? 44 : 36
  const ring = isSelected ? `box-shadow: 0 0 0 3px ${color}, 0 0 20px ${color}88;` : ''

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:${color};opacity:0.2;
        animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
      <div style="
        position:relative;width:${size}px;height:${size}px;
        background:${color};border-radius:50%;
        border:2px solid rgba(255,255,255,0.6);
        display:flex;align-items:center;justify-content:center;
        font-size:${isSelected ? 15 : 13}px;font-weight:700;color:#fff;
        font-family:Inter,sans-serif;
        ${ring}
      ">${worker.initials}</div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  })
}

function createSupervisorIcon() {
  const size = 48
  const color = '#9333ea' // Distinct Purple for supervisor
  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;">
      <div style="
        position:absolute;inset:-4px;border-radius:50%;
        background:${color};opacity:0.3;
        animation:ping 3s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
      <div style="
        position:relative;width:${size}px;height:${size}px;
        background:linear-gradient(135deg, ${color}, #c084fc);
        border-radius:50%;
        border:3px solid #fff;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        font-size:20px;font-weight:900;color:#fff;
        font-family:Inter,sans-serif;
      ">S</div>
      <div style="
        position:absolute;top:-6px;right:-6px;
        background:#fbbf24;color:#000;
        font-size:12px;border-radius:12px;padding:2px 6px;
        font-weight:bold;border:2px solid #fff;
      ">YOU</div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  })
}

function FlyToWorker({ selected }) {
  const map = useMap()
  useEffect(() => {
    if (
      selected &&
      selected.lat != null &&
      selected.lng != null &&
      Number.isFinite(selected.lat) &&
      Number.isFinite(selected.lng)
    ) {
      map.flyTo([selected.lat, selected.lng], MAP_CONFIG.flyToZoom, { duration: MAP_CONFIG.flyDuration })
    }
  }, [selected?.id, selected?.lat, selected?.lng, map])
  return null
}

export default function MapView({ workers, selectedWorker, onWorkerClick, isSimulating, onToggleSimulation, supervisorLocation }) {
  const center = MAP_CONFIG.defaultCenter
  const circleColor = { active: '#22c55e', inactive: '#f59e0b', alert: '#ef4444' }
  const onMap = workers.filter(
    (w) => w.lat != null && w.lng != null && Number.isFinite(w.lat) && Number.isFinite(w.lng)
  )

  return (
    <div className="map-section">
      <div className="map-overlay-badge">
        🗺️ Live Map &nbsp;·&nbsp; {MAP_CONFIG.regionLabel} &nbsp;·&nbsp; {onMap.length} on map / {workers.length} rostered
      </div>
      <SimFab isRunning={isSimulating} onToggle={onToggleSimulation} />
      <MapContainer
        center={center}
        zoom={MAP_CONFIG.defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url={MAP_CONFIG.tileUrl}
          attribution={MAP_CONFIG.tileAttribution}
        />
        <FlyToWorker selected={selectedWorker} />

        {supervisorLocation && (
          <Marker
            position={[supervisorLocation.lat, supervisorLocation.lng]}
            icon={createSupervisorIcon()}
          >
            <Popup className="worker-popup">
              <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#9333ea' }}>Supervisor (You)</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Live Location</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>
                  Accuracy: {Math.round(supervisorLocation.accuracy || 0)}m
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {onMap.map((worker) => {
          const isSelected = selectedWorker?.id === worker.id
          return (
            <div key={worker.id}>
              <Circle
                center={[worker.lat, worker.lng]}
                radius={isSelected ? MAP_CONFIG.circleRadius.selected : MAP_CONFIG.circleRadius.default}
                pathOptions={{
                  color: circleColor[worker.status],
                  fillColor: circleColor[worker.status],
                  fillOpacity: isSelected ? 0.14 : 0.07,
                  weight: isSelected ? 2 : 1,
                  dashArray: '4 4',
                }}
              />
              <Marker
                position={[worker.lat, worker.lng]}
                icon={createWorkerIcon(worker, isSelected)}
                eventHandlers={{ click: () => onWorkerClick(worker) }}
              >
                <Popup className="worker-popup">
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    minWidth: '180px',
                    padding: '4px',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                      {worker.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>
                      {worker.role}
                    </div>
                    <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span>📍 {worker.zone}</span>
                      <span>🕐 Checked in: {worker.checkedIn}</span>
                      <span>
                        {worker.battery != null ? `🔋 Battery: ${worker.battery}%` : '📡 Last GPS: ' + (worker.lastSeen || '—')}
                      </span>
                      <span style={{
                        marginTop: '4px', padding: '2px 8px', borderRadius: '20px',
                        background: worker.status === 'active' ? 'rgba(34,197,94,0.2)' : worker.status === 'alert' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                        color: worker.status === 'active' ? '#22c55e' : worker.status === 'alert' ? '#ef4444' : '#f59e0b',
                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', alignSelf: 'flex-start',
                      }}>
                        ● {worker.status}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          )
        })}
      </MapContainer>
    </div>
  )
}
