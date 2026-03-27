import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext';
import Badge from '../../components/shared/Badge';
import TaskForm from './TaskForm';
import './Tasks.css';

const FILTERS = ['Todas', 'Hoy', 'Vencidas', 'Pendientes', 'Completadas'];

export default function Tasks() {
  const { tasks, clients, toggleTask, deleteTask } = useCRM();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Pendientes');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const getClientName = (clientId) => {
    const c = clients.find((c) => c.id === clientId);
    return c ? `${c.firstName} ${c.lastName}` : null;
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'Hoy') return !t.completed && t.dueDate === today;
    if (filter === 'Vencidas') return !t.completed && t.dueDate < today;
    if (filter === 'Pendientes') return !t.completed;
    if (filter === 'Completadas') return t.completed;
    return true;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pd = { High: 0, Medium: 1, Low: 2 };
    return (pd[a.priority] || 1) - (pd[b.priority] || 1) || a.dueDate.localeCompare(b.dueDate);
  });

  const counts = {
    Todas: tasks.length,
    Hoy: tasks.filter(t => !t.completed && t.dueDate === today).length,
    Vencidas: tasks.filter(t => !t.completed && t.dueDate < today).length,
    Pendientes: tasks.filter(t => !t.completed).length,
    Completadas: tasks.filter(t => t.completed).length,
  };

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tareas y Seguimientos</h1>
          <p className="page-subtitle">{counts.Pendientes} pendientes · {counts.Vencidas} vencidas</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowForm(true); }}>
          + Nueva Tarea
        </button>
      </div>

      <div className="card tasks-toolbar">
        <div className="status-filters">
          {FILTERS.map((f) => (
            <button key={f} className={`filter-btn${filter === f ? ' active' : ''}${f === 'Vencidas' && counts.Vencidas > 0 ? ' filter-btn-warn' : ''}`}
              onClick={() => setFilter(f)}>
              {f}
              {counts[f] > 0 && <span className="filter-count">{counts[f]}</span>}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✓</div>
            <h3>Sin tareas en esta vista</h3>
            <p>¡Al día con todo!</p>
          </div>
        </div>
      ) : (
        <div className="tasks-list card">
          {filtered.map((task) => {
            const isOverdue = !task.completed && task.dueDate < today;
            const isToday = !task.completed && task.dueDate === today;
            const clientName = getClientName(task.clientId);

            return (
              <div key={task.id} className={`task-item-full${task.completed ? ' task-completed' : ''}${isOverdue ? ' task-overdue-item' : ''}${isToday ? ' task-today-item' : ''}`}>
                <button className={`task-check-btn${task.completed ? ' checked' : ''}`} onClick={() => toggleTask(task.id)}>
                  {task.completed ? '✓' : ''}
                </button>
                <div className="task-item-body">
                  <div className="task-item-top">
                    <span className="task-item-title">{task.title}</span>
                    <div className="task-item-badges">
                      <Badge label={task.priority} size="sm" />
                      {isOverdue && <span className="overdue-badge">⚠ Vencida</span>}
                      {isToday && <span className="today-badge">Hoy</span>}
                    </div>
                  </div>
                  <div className="task-item-meta">
                    {clientName && (
                      <button className="task-client-link" onClick={() => navigate(`/clients/${task.clientId}`)}>
                        👤 {clientName}
                      </button>
                    )}
                    {task.dueDate && (
                      <span className={`task-due${isOverdue ? ' overdue' : ''}`}>
                        📅 {task.dueDate}
                      </span>
                    )}
                  </div>
                  {task.notes && <div className="task-item-notes">{task.notes}</div>}
                </div>
                <div className="task-item-actions">
                  <button className="btn-icon" onClick={() => { setEditTask(task); setShowForm(true); }} title="Editar">✏</button>
                  <button className="btn-icon btn-icon-danger" onClick={() => { if (window.confirm('¿Eliminar tarea?')) deleteTask(task.id); }} title="Eliminar">🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <TaskForm
          task={editTask}
          onClose={() => { setShowForm(false); setEditTask(null); }}
        />
      )}
    </div>
  );
}
