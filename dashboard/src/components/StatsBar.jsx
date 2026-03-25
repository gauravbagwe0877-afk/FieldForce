export default function StatsBar({ total, active, inactive, alerts, zonesCovered }) {
  const stats = [
    { icon: '👷', value: total ?? 0, label: 'Total Workers', color: '#5b8cc9', bg: 'rgba(91,140,201,0.14)' },
    { icon: '✅', value: active ?? 0, label: 'Active Now', color: '#3db88a', bg: 'rgba(61,184,138,0.14)' },
    { icon: '⏸️', value: inactive ?? 0, label: 'Inactive', color: '#d9a84a', bg: 'rgba(217,168,74,0.14)' },
    { icon: '🚨', value: alerts ?? 0, label: 'Alerts', color: '#e87878', bg: 'rgba(232,120,120,0.14)' },
    { icon: '📍', value: zonesCovered ?? 0, label: 'Dept. groups', color: '#8b7fd4', bg: 'rgba(139,127,212,0.14)' },
  ]

  return (
    <div className="stats-bar">
      {stats.map((s) => (
        <div className="stat-card" key={s.label}>
          <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
            {s.icon}
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
