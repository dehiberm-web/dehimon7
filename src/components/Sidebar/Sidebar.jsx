import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext';
import './Sidebar.css';

const navItems = [
  { path: '/', icon: '▦', label: 'Dashboard', exact: true },
  { path: '/clients', icon: '👥', label: 'Clientes' },
  { path: '/policies', icon: '📋', label: 'Pólizas' },
  { path: '/pipeline', icon: '⬡', label: 'Pipeline' },
  { path: '/tasks', icon: '✓', label: 'Tareas' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { getStats } = useCRM();
  const stats = getStats();
  const location = useLocation();

  return (
    <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🛡</div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">InsureCRM</span>
            <span className="sidebar-logo-sub">Life & Annuities</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
              {!collapsed && item.path === '/tasks' && stats.tasksDueToday > 0 && (
                <span className="sidebar-badge">{stats.tasksDueToday}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-stats">
            <div className="sidebar-stat">
              <span className="sidebar-stat-value">{stats.totalClients}</span>
              <span className="sidebar-stat-label">Clientes</span>
            </div>
            <div className="sidebar-stat">
              <span className="sidebar-stat-value">{stats.activePolicies}</span>
              <span className="sidebar-stat-label">Pólizas</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
