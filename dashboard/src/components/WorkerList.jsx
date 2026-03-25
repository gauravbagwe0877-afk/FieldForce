const statusBorderClass = {
  active: 'active-border',
  inactive: 'inactive-border',
  alert: 'alert-border',
}

const statusClass = {
  active: 'status-active',
  inactive: 'status-inactive',
  alert: 'status-alert',
}

function getBatteryEmoji(pct) {
  if (pct > 60) return '🔋'
  if (pct > 20) return '🪫'
  return '⚡'
}

export default function WorkerList({ workers, search, onSelectWorker, selectedWorker }) {
  const filtered = workers.filter((w) => {
    const q = search.toLowerCase()
    const zone = (w.zone || '').toLowerCase()
    return (
      (w.name || '').toLowerCase().includes(q) ||
      zone.includes(q) ||
      (w.role || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="sidebar-content">
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 24 }}>
          No workers found
        </div>
      )}
      {filtered.map((w, i) => (
        <div
          key={w.id}
          className={`worker-card ${statusBorderClass[w.status]} ${selectedWorker?.id === w.id ? 'worker-card--selected' : ''}`}
          style={{ animationDelay: `${i * 0.04}s` }}
          onClick={() => onSelectWorker(w)}
        >
          <div className="worker-top">
            <div
              className="worker-avatar"
              style={{ background: w.bg, color: w.color }}
            >
              {w.initials}
            </div>
            <div>
              <div className="worker-name">{w.name}</div>
              <div className="worker-role">{w.role}</div>
            </div>
            <span className={`worker-status ${statusClass[w.status]}`}>
              {w.status}
            </span>
          </div>
          <div className="worker-meta">
            <span className="worker-meta-item">📍 {(w.zone || '').split(' - ')[0] || '—'}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="worker-meta-item">🕐 {w.lastSeen}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="worker-meta-item">
              {w.battery != null ? `${getBatteryEmoji(w.battery)} ${w.battery}%` : '📡 GPS'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
