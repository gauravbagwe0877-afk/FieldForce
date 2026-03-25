import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiUrl } from '../config/api';

export default function AdminProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState('');
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const departments = [
    "Healthcare", 
    "General Administration", 
    "Engineering", 
    "Town Planning", 
    "Finance", 
    "Education"
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(apiUrl('/api/user/profile'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (data.department) {
          setDepartment(data.department);
        }
      } else {
        if (res.status === 401) {
          sessionStorage.clear();
          navigate('/');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async () => {
    try {
      setErrorMsg('');
      setMsg('');
      const token = sessionStorage.getItem('token');
      const res = await fetch(apiUrl('/api/user/department'), {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ department })
      });
      
      if (res.ok) {
        setMsg('Profile updated successfully!');
        fetchProfile(); // Refresh user
      } else {
        const err = await res.text();
        setErrorMsg(err);
      }
    } catch (e) {
      setErrorMsg('Failed to update profile.');
    }
  };

  const hasDepartmentFixed = user && user.department && user.department.trim() !== '';

  return (
    <div className="profile-layout">
      <Navbar alertCount={0} />
      <div className="profile-inner">
        <div className="profile-card">
          <h2>Admin Profile</h2>
          <p className="profile-lead">Manage your administrative details.</p>

          {msg && <div className="profile-msg-success">{msg}</div>}
          {errorMsg && <div className="profile-msg-error">{errorMsg}</div>}

          {user ? (
            <div>
              <div className="profile-field">
                <span className="profile-field-label">Admin / Employee ID</span>
                <div className="profile-field-value">{user.employeeCode || 'N/A'}</div>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">Name</span>
                <div className="profile-field-value">{user.name}</div>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">Email</span>
                <div className="profile-field-value">{user.email}</div>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">Department</span>
                <select
                  className="profile-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={hasDepartmentFixed}
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                  {user.department && !departments.includes(user.department) && (
                    <option value={user.department}>{user.department}</option>
                  )}
                </select>
                {hasDepartmentFixed && (
                  <span className="profile-hint">Department cannot be changed once set.</span>
                )}
              </div>

              {!hasDepartmentFixed && (
                <button type="button" className="profile-btn-primary" onClick={handleUpdate}>
                  Save Department
                </button>
              )}
            </div>
          ) : (
            <p className="profile-loading">Loading profile...</p>
          )}
        </div>
      </div>
    </div>
  );
}
