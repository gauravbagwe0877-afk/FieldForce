import { useState, useEffect } from 'react'
import { apiUrl } from '../config/api'

export default function TaskAssignmentPanel() {
  const [workers, setWorkers] = useState([])
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedToId: '',
    taskType: 'OTHER',
    priority: 'MEDIUM'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = sessionStorage.getItem('token')
    try {
      // 1. Fetch workers for this supervisor
      const wRes = await fetch(apiUrl('/api/user/workers'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (wRes.ok) setWorkers(await wRes.json())

      // 2. Fetch existing tasks
      const tRes = await fetch(apiUrl('/api/tasks'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (tRes.ok) setTasks(await tRes.json())
    } catch (e) {
      console.error("Error fetching task data", e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.assignedToId || !form.title) return alert("Worker and Title are required")
    
    setLoading(true)
    const token = sessionStorage.getItem('token')
    try {
      const res = await fetch(apiUrl('/api/tasks'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          taskTitle: form.title,
          description: form.description,
          assignedToId: parseInt(form.assignedToId),
          taskType: form.taskType,
          priority: form.priority
        })
      })
      if (res.ok) {
        setMessage("Task assigned successfully!")
        setForm({ title: '', description: '', assignedToId: '', taskType: 'OTHER', priority: 'MEDIUM' })
        fetchData()
      }
    } catch (err) {
      alert("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="task-panel">
      <h3 className="section-title">Assignment Desk</h3>
      
      {message && <p className="success-msg">{message}</p>}

      <form onSubmit={handleSubmit} className="task-form">
        <select value={form.assignedToId} onChange={e => setForm({...form, assignedToId: e.target.value})} className="task-input">
          <option value="">Select Worker...</option>
          {workers.map(w => <option key={w.userId} value={w.userId}>{w.name} ({w.employeeCode})</option>)}
        </select>
        
        <input type="text" placeholder="Task Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="task-input" />
        <textarea placeholder="Description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="task-input" />
        
        <div className="form-row">
          <select value={form.taskType} onChange={e => setForm({...form, taskType: e.target.value})} className="task-input half">
            <option value="WASTE_COLLECTION">Waste Collection</option>
            <option value="SWEEPING">Sweeping</option>
            <option value="ROAD_WORK">Road Work</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="OTHER">Other</option>
          </select>
          <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="task-input half">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent!</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="task-submit">
          {loading ? 'Assigning...' : '➔ Assign Task'}
        </button>
      </form>

      <div className="task-list">
        <h4 className="sub-title">Recent Handouts</h4>
        {tasks.length === 0 ? <p className="muted">No active tasks assigned yet.</p> : (
          tasks.map(t => (
            <div key={t.taskId} className="task-item">
              <div className="ti-header">
                <span className="ti-worker">{t.assignedToName}</span>
                <span className={`ti-status ${t.status.toLowerCase()}`}>{t.status}</span>
              </div>
              <p className="ti-title">{t.taskTitle}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
