import { useState, useEffect } from 'react'
import { apiUrl } from '../config/api'

export default function AddWorkerPanel() {
  const [supervisorCode, setSupervisorCode] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    employeeCode: '',
    phone: '',
    department: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('success')

  useEffect(() => {
    // Fetch the logged-in supervisor's own employeeCode
    const token = sessionStorage.getItem('token')
    if (!token) return
    fetch(apiUrl('/api/user/profile'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((profile) => {
        if (profile.employeeCode) setSupervisorCode(profile.employeeCode)
      })
      .catch(() => {})
  }, [])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)

    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.employeeCode.trim()) {
      setMessage('Name, Email, Password, and Employee Code are required.')
      setMessageType('error')
      return
    }
    if (!supervisorCode) {
      setMessage('Could not determine your supervisor employee code. Please re-login.')
      setMessageType('error')
      return
    }

    setSubmitting(true)
    try {
      const token = sessionStorage.getItem('token')

      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
          employeeCode: form.employeeCode.trim(),
          phone: form.phone.trim(),
          department: form.department.trim(),
          role: 'WORKER',
          supervisorEmployeeCode: supervisorCode,
        }),
      })

      const text = await res.text()
      if (res.ok) {
        setMessage(`Worker "${form.name}" registered successfully!`)
        setMessageType('success')
        setForm({ name: '', email: '', password: '', employeeCode: '', phone: '', department: '' })
      } else {
        setMessage(text || 'Registration failed.')
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Network error: ' + err.message)
      setMessageType('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="add-worker-panel">
      <h3 className="awp-title">Register New Worker</h3>
      <p className="awp-subtitle">
        Add a field worker to the system. They will be linked to you (
        <strong>{supervisorCode || '…'}</strong>) and can log in via the mobile app.
      </p>

      {message && (
        <div className={`awp-message ${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="awp-form">
        <label className="awp-label">
          Full Name <span className="required">*</span>
          <input className="awp-input" type="text" value={form.name} onChange={update('name')} placeholder="e.g. Ravi Kumar" />
        </label>

        <label className="awp-label">
          Email <span className="required">*</span>
          <input className="awp-input" type="email" value={form.email} onChange={update('email')} placeholder="e.g. ravi@work.org" />
        </label>

        <label className="awp-label">
          Password <span className="required">*</span>
          <input className="awp-input" type="password" value={form.password} onChange={update('password')} placeholder="Min 6 characters" />
        </label>

        <label className="awp-label">
          Employee Code <span className="required">*</span>
          <input className="awp-input" type="text" value={form.employeeCode} onChange={update('employeeCode')} placeholder="e.g. WRK-042" />
        </label>

        <label className="awp-label">
          Phone
          <input className="awp-input" type="tel" value={form.phone} onChange={update('phone')} placeholder="e.g. 9876543210" />
        </label>

        <label className="awp-label">
          Department
          <input className="awp-input" type="text" value={form.department} onChange={update('department')} placeholder="e.g. Sanitation" />
        </label>

        <button className="awp-submit" type="submit" disabled={submitting}>
          {submitting ? 'Registering…' : '＋  Add Worker'}
        </button>
      </form>
    </div>
  )
}
