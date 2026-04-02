import { useState, useEffect } from 'react'
import { apiUrl } from '../config/api'

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const res = await fetch(apiUrl('/api/analytics/summary'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setData(await res.json())
    } catch (e) {
      console.error("Analytics fetch failed", e)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    const token = sessionStorage.getItem('token')
    window.open(apiUrl(`/api/analytics/export/csv?token=${token}`), '_blank')
    // Note: If the API requires Bearer token in header, window.open fails. 
    // Usually we append token as query param or fetch as blob.
    // I'll implementation a fetch-side download for reliability.
    try {
      const res = await fetch(apiUrl('/api/analytics/export/csv'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      const blob = await res.json() // wait, backend returns byte[]
      const url = window.URL.createObjectURL(new Blob([await res.blob()]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'analytics_export.csv')
      document.body.appendChild(link)
      link.click()
    } catch(e) {
      alert("Export failed")
    }
  }

  if (loading) return <div className="p-4">Calculating metrics...</div>
  if (!data) return <div className="p-4 text-red-500">Access Denied: Admin only.</div>

  return (
    <div className="analytics-dash">
      <div className="dash-header">
        <h3 className="section-title">System Insights</h3>
        <button onClick={handleExport} className="export-btn">📥  Export CSV</button>
      </div>

      <div className="analytics-grid">
        <div className="stat-card">
          <label>Total Workforce</label>
          <div className="val">{data.totalWorkers}</div>
        </div>
        <div className="stat-card">
          <label>Live Today</label>
          <div className="val">{data.activeWorkers}</div>
        </div>
        <div className="stat-card">
          <label>Completed Tasks</label>
          <div className="val">{data.completedTasks} / {data.totalTasks}</div>
        </div>
        <div className="stat-card">
          <label>Mileage (System)</label>
          <div className="val">{data.totalDistanceKm} km</div>
        </div>
      </div>

      <div className="top-workers">
        <h4 className="sub-title">Performance leaderboard</h4>
        <div className="worker-table">
          {data.topWorkers.map(w => (
            <div key={w.employeeCode} className="table-row">
              <span className="w-name">{w.name}</span>
              <span className="w-code">{w.employeeCode}</span>
              <span className="w-tasks">{w.tasksCompleted} Tasks Done</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
