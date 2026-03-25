import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar({ alertCount, sosCount = 0 }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const fmt = (n) => String(n).padStart(2, '0')
  const timeStr = `${fmt(time.getHours())}:${fmt(time.getMinutes())}:${fmt(time.getSeconds())}`

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-title">Dashboard Overview</div>
      </div>

      <div className="navbar-center">
        <div className="live-dot" />
        <span className="live-label">LIVE</span>
      </div>

      <div className="navbar-right">
        <span className="nav-time">{timeStr}</span>
        {alertCount > 0 && (
          <span className="nav-badge">⚠️ {alertCount} Alerts</span>
        )}
        {sosCount > 0 && (
          <span className="nav-badge nav-badge--sos">🆘 {sosCount} SOS</span>
        )}
        <Link to="/profile" style={{ textDecoration: 'none' }} title="Profile">
          <div className="nav-avatar">A</div>
        </Link>
      </div>
    </nav>
  )
}
