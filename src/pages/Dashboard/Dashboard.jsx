import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext';
import Badge from '../../components/shared/Badge';
import './Dashboard.css';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card" style={{ '--accent': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

const activityIcons = { note: '📝', call: '📞', policy: '📋', lead: '👤', task: '✓' };

export default function Dashboard() {
  const { getStats, clients, tasks, activity } = useCRM();
  const navigate = useNavigate();
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];

  const urgentTasks = tasks.filter((t) => !t.completed && t.dueDate <= today).slice(0, 5);
  const recentActivity = activity.slice(0, 6);
  const recentClients = [...clients].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString('es-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/clients')}>
          + Nuevo Cliente
        </button>
      </div>

      <div className="stat-grid">
        <StatCard icon="👥" label="Total Clientes" value={stats.totalClients} color="#2563eb" />
        <StatCard icon="📋" label="Pólizas Activas" value={stats.activePolicies} sub={`${fmt(stats.totalPremium)}/año`} color="#16a34a" />
        <StatCard icon="⬡" label="Valor Pipeline" value={fmt(stats.pipelineValue)} sub="primas potenciales" color="#7c3aed" />
        <StatCard icon="⏰" label="Tareas Pendientes" value={stats.tasksDueToday} sub="hoy o vencidas" color={stats.tasksDueToday > 0 ? '#dc2626' : '#16a34a'} />
      </div>

      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="card dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Actividad Reciente</h3>
          </div>
          <div className="activity-list">
            {recentActivity.length === 0 && <div className="empty-state"><p>Sin actividad reciente</p></div>}
            {recentActivity.map((item) => (
              <div key={item.id} className="activity-item" onClick={() => navigate(`/clients/${item.clientId}`)}>
                <div className="activity-icon">{activityIcons[item.type] || '•'}</div>
                <div className="activity-body">
                  <div className="activity-client">{item.clientName}</div>
                  <div className="activity-text">{item.text}</div>
                  <div className="activity-date">{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="card dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Tareas Urgentes</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tasks')}>Ver todas</button>
          </div>
          {urgentTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✓</div>
              <h3>Al día</h3>
              <p>No hay tareas urgentes</p>
            </div>
          ) : (
            <div className="task-list">
              {urgentTasks.map((task) => (
                <div key={task.id} className={`task-item ${task.dueDate < today ? 'task-overdue' : ''}`}>
                  <div className="task-priority-dot" data-priority={task.priority} />
                  <div className="task-body">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <Badge label={task.priority} size="sm" />
                      <span className={`task-date ${task.dueDate < today ? 'overdue' : ''}`}>
                        {task.dueDate < today ? '⚠ Vencida: ' : ''}{task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="card dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Clientes Recientes</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/clients')}>Ver todos</button>
          </div>
          <div className="clients-mini-list">
            {recentClients.map((c) => (
              <div key={c.id} className="client-mini" onClick={() => navigate(`/clients/${c.id}`)}>
                <div className="client-mini-avatar">{c.firstName[0]}{c.lastName[0]}</div>
                <div className="client-mini-info">
                  <div className="client-mini-name">{c.firstName} {c.lastName}</div>
                  <div className="client-mini-meta">{c.phone}</div>
                </div>
                <Badge label={c.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
