import { useDispatch } from 'react-redux'
import { clearSelection } from '../store/workerSlice'

const statusLabel = { active: 'Active', inactive: 'Inactive', alert: 'Alert' }
const statusClass = { active: 'status-active', inactive: 'status-inactive', alert: 'status-alert' }

function BatteryBar({ pct }) {
  const color = pct > 60 ? '#22c55e' : pct > 20 ? '#f59e0b' : '#ef4444'
  return (
    <div className="battery-wrap">
      <div className="battery-track">
        <div
          className="battery-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="battery-pct" style={{ color }}>{pct}%</span>
    </div>
  )
}

export default function WorkerDetail({ worker }) {
  const dispatch = useDispatch()
  if (!worker) return null

  return (
    <div className="worker-detail">
      <div className="worker-detail-header">
        <div className="worker-avatar" style={{ background: worker.bg, color: worker.color, width: 44, height: 44, fontSize: 16 }}>
          {worker.initials}
        </div>
        <div className="worker-detail-info">
          <div className="worker-name" style={{ fontSize: 14 }}>{worker.name}</div>
          <div className="worker-role">{worker.role}</div>
        </div>
        <span className={`worker-status ${statusClass[worker.status]}`}>{statusLabel[worker.status]}</span>
        <button className="detail-close" onClick={() => dispatch(clearSelection())}>✕</button>
      </div>

      <div className="worker-detail-grid">
        <div className="detail-item">
          <span className="detail-label">📍 Zone</span>
          <span className="detail-value">{worker.zone}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">🕐 Checked In</span>
          <span className="detail-value">{worker.checkedIn}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">👁 Last Seen</span>
          <span className="detail-value">{worker.lastSeen}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">📡 GPS (lat, lng)</span>
          <span className="detail-value gps-coords">
            {worker.lat != null && worker.lng != null
              ? `${Number(worker.lat).toFixed(6)}, ${Number(worker.lng).toFixed(6)}`
              : 'No fix yet'}
          </span>
        </div>
        {worker.accuracyM != null && (
          <div className="detail-item">
            <span className="detail-label">± Accuracy</span>
            <span className="detail-value">{worker.accuracyM} m</span>
          </div>
        )}
      </div>

      {worker.battery != null && (
        <div className="detail-item" style={{ marginTop: 8 }}>
          <span className="detail-label">🔋 Battery</span>
          <BatteryBar pct={worker.battery} />
        </div>
      )}
    </div>
  )
}
