/** Reserved for future API-driven geofence / battery / idle alerts. */
const ALERTS = []

export default function AlertsPanel() {
  if (ALERTS.length === 0) {
    return (
      <div className="sidebar-content" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 28, padding: '0 16px', lineHeight: 1.5 }}>
        No alerts yet. Geofence and device rules can be wired to the backend later; worker positions come from live GPS
        updates.
      </div>
    )
  }
  return (
    <div className="sidebar-content">
      {ALERTS.map((a, i) => (
        <div
          key={a.id}
          className={`alert-item ${a.type}`}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="alert-icon">{a.icon}</div>
          <div className="alert-body">
            <div className="alert-title">{a.title}</div>
            <div className="alert-desc">{a.desc}</div>
            <div className="alert-time">{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
