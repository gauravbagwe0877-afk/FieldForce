import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Briefcase, Hash, Users, MapPin, Lock, Phone } from 'lucide-react';
import { apiUrl } from '../config/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeCode: '',
    department: '',
    phone: '',
    password: '',
    role: 'WORKER',
    supervisorEmployeeCode: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      if (isLogin) {
        const loginBody = {
          email: formData.email,
          password: formData.password,
        };
        if (formData.supervisorEmployeeCode?.trim()) {
          loginBody.supervisorEmployeeCode = formData.supervisorEmployeeCode.trim();
        }
        const response = await fetch(apiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginBody),
        });

        const raw = await response.text();
        let data;
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = { message: raw };
        }
        if (response.ok) {
          sessionStorage.setItem('token', data.jwt || data.accessToken || data.token || '');
          sessionStorage.setItem('employeeCode', data.supervisorEmployeeCode || '');
          sessionStorage.setItem(
            'user',
            JSON.stringify({
              id: data.id,
              username: data.username || data.email,
              roles: data.roles,
              supervisorName: data.supervisorName,
              supervisorEmployeeCode: data.supervisorEmployeeCode,
            })
          );
          navigate('/dashboard');
        } else {
          setErrorMsg(data.message || raw || 'Login failed.');
        }
      } else {
        if (formData.role === 'WORKER' && !formData.supervisorEmployeeCode?.trim()) {
          setErrorMsg('Supervisor ID is required when registering a worker.');
          return;
        }
        const regBody = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          employeeCode: formData.employeeCode,
          department: formData.department,
          phone: formData.phone,
          role: formData.role,
        };
        if (formData.role === 'WORKER') {
          regBody.supervisorEmployeeCode = formData.supervisorEmployeeCode.trim();
        }
        const response = await fetch(apiUrl('/api/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(regBody),
        });
        
        if (response.ok) {
          setIsLogin(true);
          setErrorMsg('Registration successful! Please login.');
        } else {
          const errMsg = await response.text();
          setErrorMsg(errMsg || 'Registration failed.');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred. Please make sure the backend is running.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
      <div className="login-header">
        <div className="login-icon-wrapper">
          <MapPin size={28} color="#ffffff" />
        </div>
        <h1 className="login-title">Field Force</h1>
        <p className="login-subtitle">Municipal workforce system</p>
      </div>

      <form onSubmit={handleSubmit}>
        {errorMsg && (
          <div
            className={`login-error ${isLogin && errorMsg.includes('successful') ? 'login-error--success' : ''}`}
          >
            {errorMsg}
          </div>
        )}

        {!isLogin && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                name="name"
                className="form-input" 
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={20} />
            <input 
              type="email" 
              name="email"
              className="form-input" 
              placeholder="john.doe@company.com"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              name="password"
              className="form-input" 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
        </div>

        {isLogin && (
          <div className="form-group">
            <label className="form-label">Supervisor ID (workers only)</label>
            <div className="input-wrapper">
              <Hash className="input-icon" size={20} />
              <input
                type="text"
                name="supervisorEmployeeCode"
                className="form-input"
                placeholder="Leave blank for admin / supervisor login"
                value={formData.supervisorEmployeeCode}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {!isLogin && (
          <>
            <div className="form-group">
              <label className="form-label">Employee Code</label>
              <div className="input-wrapper">
                <Hash className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="employeeCode"
                  className="form-input" 
                  placeholder="EMP-XXXXX"
                  value={formData.employeeCode}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <div className="input-wrapper">
                <Briefcase className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="department"
                  className="form-input" 
                  placeholder="e.g. Sanitation"
                  value={formData.department}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="phone"
                  className="form-input" 
                  placeholder="1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="input-wrapper select-wrapper">
                <Users className="input-icon" size={20} />
                <select 
                  name="role" 
                  className="form-input form-select gender-select"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="WORKER">Worker</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            {formData.role === 'WORKER' && (
              <div className="form-group">
                <label className="form-label">Supervisor ID</label>
                <div className="input-wrapper">
                  <Hash className="input-icon" size={20} />
                  <input
                    type="text"
                    name="supervisorEmployeeCode"
                    className="form-input"
                    placeholder="Existing supervisor employee code in database"
                    value={formData.supervisorEmployeeCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}
          </>
        )}

        <button type="submit" className="submit-btn">
          {isLogin ? 'Login' : 'Register'}
        </button>

        <p className="login-link" onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}>
          {isLogin ? "Don't have an account? Register here" : "Already have an account? Login here"}
        </p>
      </form>
      </div>
    </div>
  );
};

export default LoginPage;
