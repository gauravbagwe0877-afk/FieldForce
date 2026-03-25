import { useState, useEffect } from 'react'
import { apiUrl } from '../config/api'

export default function SosPanel() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    const load = async () => {
      setErr('')
      try {
        const token = sessionStorage.getItem('token')
        const res = await fetch(apiUrl('/api/emergency/list'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 403) {
          setErr('Only supervisors and admins can view SOS reports.')
          setItems([])
          return
        }
        if (!res.ok) {
          setErr('Could not load SOS list.')
          return
        }
        const data = await res.json()
        setItems(Array.isArray(data) ? data : [])
      } catch {
        setErr('Network error.')
      } finally {
        setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return <div className="sidebar-content sos-empty">Loading SOS…</div>
  }

  if (err) {
    return <div className="sidebar-content sos-empty">{err}</div>
  }

  if (items.length === 0) {
    return (
      <div className="sidebar-content sos-empty">
        No emergency reports yet. Workers send these from the mobile app (SOS screen).
      </div>
    )
  }

  return (
    <div className="sidebar-content sos-list">
      {items.map((e) => (
        <div key={e.incidentId} className={`sos-card sos-card--${(e.status || 'OPEN').toLowerCase()}`}>
          <div className="sos-card-head">
            <span className="sos-badge">{e.status || 'OPEN'}</span>
            <span className="sos-time">
              {e.createdAt ? new Date(e.createdAt).toLocaleString() : ''}
            </span>
          </div>
          <div className="sos-title">{e.title || 'SOS'}</div>
          <div className="sos-worker">
            {e.workerName} · {e.employeeCode}
          </div>
          <p className="sos-desc">{e.description || '—'}</p>
          {e.latitude != null && e.longitude != null && (
            <div className="sos-loc">
              📍 {Number(e.latitude).toFixed(5)}, {Number(e.longitude).toFixed(5)}
              {e.accuracy != null && ` (±${Math.round(e.accuracy)} m)`}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
