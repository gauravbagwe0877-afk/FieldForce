import { Link } from 'react-router-dom';

export default function SidebarNav({ activeTab, onTabSelect, alertCount, sosCount }) {
  return (
    <aside className="sidebar-main-nav">
      <div className="sidebar-brand">
        <img src="/logo.jpg" alt="Field Force Logo" className="sidebar-logo-img" />
        <div className="sidebar-brand-text">
          <div className="sidebar-title">Field Force</div>
          <div className="sidebar-subtitle">Workforce System</div>
        </div>
      </div>

      <div className="sidebar-menu">
        <p className="sidebar-menu-label">Menu</p>

        <button 
          className={`sidebar-nav-item ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => onTabSelect('map')}
        >
          <span className="nav-icon">🗺️</span>
          <span className="nav-text">Live Map</span>
        </button>

        <button 
          className={`sidebar-nav-item ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => onTabSelect('workers')}
        >
          <span className="nav-icon">👷</span>
          <span className="nav-text">Staff Roster</span>
        </button>

        <button 
          className={`sidebar-nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => onTabSelect('alerts')}
        >
          <span className="nav-icon">🚨</span>
          <span className="nav-text">Incidents</span>
          {alertCount > 0 && <span className="nav-badge-pill">{alertCount}</span>}
        </button>

        <button 
          className={`sidebar-nav-item ${activeTab === 'sos' ? 'active' : ''}`}
          onClick={() => onTabSelect('sos')}
        >
          <span className="nav-icon">🆘</span>
          <span className="nav-text">SOS Alerts</span>
          {sosCount > 0 && <span className="nav-badge-pill emergency">{sosCount}</span>}
        </button>

        <button 
          className={`sidebar-nav-item ${activeTab === 'addworker' ? 'active' : ''}`}
          onClick={() => onTabSelect('addworker')}
        >
          <span className="nav-icon">➕</span>
          <span className="nav-text">Add Worker</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <Link to="/profile" className="sidebar-profile-link">
          <div className="sidebar-avatar">S</div>
          <div className="sidebar-profile-info">
            <span className="profile-name">Supervisor</span>
            <span className="profile-role">View Profile</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
