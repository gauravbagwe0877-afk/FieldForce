/** GPS older than this is treated as stale for "active" status (dashboard only). */
const STALE_MS = 20 * 60 * 1000

function formatLastSeen(iso) {
  if (!iso) return 'No GPS yet'
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const sec = Math.floor((Date.now() - t) / 1000)
  if (sec < 10) return 'Just now'
  if (sec < 60) return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}

function workerColors(id) {
  const hues = [142, 210, 260, 320, 30, 200, 180]
  const h = hues[Number(id) % hues.length]
  return {
    color: `hsl(${h} 55% 42%)`,
    bg: `hsla(${h} 55% 42% / 0.22)`,
  }
}

/**
 * Maps one row from GET /api/location/latest into the shape used by the dashboard UI.
 */
export function mapLocationRow(d) {
  const hasFix =
    d.latitude != null &&
    d.longitude != null &&
    !Number.isNaN(Number(d.latitude)) &&
    !Number.isNaN(Number(d.longitude))

  const recordedAt = d.recordedAt ? new Date(d.recordedAt).getTime() : null
  const fresh =
    hasFix && recordedAt != null && !Number.isNaN(recordedAt) && Date.now() - recordedAt < STALE_MS
  const accountActive = String(d.userStatus || 'ACTIVE').toUpperCase() === 'ACTIVE'
  const isCheckedOut = d.checkedOut === true
  const status = accountActive && fresh && !isCheckedOut ? 'active' : 'inactive'

  const name = d.name || d.userName || 'Worker'
  const parts = name.split(/\s+/).filter(Boolean)
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase() || 'W'

  const dept = d.department?.trim()
  const zone = dept ? dept : d.employeeCode ? `Code ${d.employeeCode}` : 'Field roster'

  return {
    id: d.userId,
    name,
    initials,
    role: dept || 'Field worker',
    zone,
    phone: d.phone && String(d.phone).trim() !== '' ? d.phone : '—',
    lat: hasFix ? Number(d.latitude) : null,
    lng: hasFix ? Number(d.longitude) : null,
    accuracyM: d.accuracy != null ? Math.round(Number(d.accuracy)) : null,
    status,
    battery: null,
    lastSeen: formatLastSeen(d.recordedAt),
    lastUpdate: d.recordedAt,
    checkedIn: d.recordedAt
      ? new Date(d.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '—',
    ...workerColors(d.userId),
  }
}
