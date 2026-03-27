import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext';
import Badge from '../../components/shared/Badge';
import ClientForm from './ClientForm';
import PolicyForm from '../Policies/PolicyForm';
import TaskForm from '../Tasks/TaskForm';
import './ClientDetail.css';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getClient, updateClient, deleteClient, getPoliciesForClient, getTasksForClient,
          deletePolicy, toggleTask, addActivity, activity } = useCRM();

  const client = getClient(id);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [editPolicy, setEditPolicy] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!client) {
    return (
      <div className="not-found">
        <h2>Cliente no encontrado</h2>
        <button className="btn btn-primary" onClick={() => navigate('/clients')}>← Volver</button>
      </div>
    );
  }

  const policies = getPoliciesForClient(id);
  const tasks = getTasksForClient(id);
  const clientActivity = activity.filter((a) => a.clientId === id);
  const today = new Date().toISOString().split('T')[0];

  const totalPremium = policies.filter(p => p.status === 'Active').reduce((s, p) => s + (p.annualPremium || 0), 0);
  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const calcAge = (dob) => {
    if (!dob) return null;
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };

  const handleClientSave = (data) => {
    updateClient(id, { ...data, lastContact: today });
    setShowClientForm(false);
  };

  const handleDeleteClient = () => {
    if (window.confirm(`¿Eliminar a ${client.firstName} ${client.lastName} y todos sus datos?`)) {
      deleteClient(id);
      navigate('/clients');
    }
  };

  const handleDeletePolicy = (pid) => {
    if (window.confirm('¿Eliminar esta póliza?')) deletePolicy(pid);
  };

  return (
    <div className="client-detail">
      <div className="detail-breadcrumb">
        <button className="breadcrumb-back" onClick={() => navigate('/clients')}>← Clientes</button>
        <span className="breadcrumb-sep">/</span>
        <span>{client.firstName} {client.lastName}</span>
      </div>

      <div className="detail-header card">
        <div className="detail-header-main">
          <div className="detail-avatar">{client.firstName[0]}{client.lastName[0]}</div>
          <div className="detail-info">
            <div className="detail-name">{client.firstName} {client.lastName}</div>
            <div className="detail-meta-row">
              <Badge label={client.status} />
              {client.dateOfBirth && <span className="detail-age">{calcAge(client.dateOfBirth)} años</span>}
              <span className="detail-meta-text">Cliente desde {client.createdAt}</span>
            </div>
            <div className="detail-contacts">
              {client.phone && <span>📞 {client.phone}</span>}
              {client.email && <span>✉ {client.email}</span>}
              {client.address && <span>📍 {client.address}</span>}
            </div>
          </div>
        </div>
        <div className="detail-header-actions">
          <div className="detail-stat-pills">
            <div className="detail-stat-pill">
              <span className="dsp-value">{policies.filter(p => p.status === 'Active').length}</span>
              <span className="dsp-label">Pólizas Activas</span>
            </div>
            <div className="detail-stat-pill">
              <span className="dsp-value">{fmt(totalPremium)}</span>
              <span className="dsp-label">Prima Anual</span>
            </div>
            <div className="detail-stat-pill">
              <span className="dsp-value">{tasks.filter(t => !t.completed).length}</span>
              <span className="dsp-label">Tareas Abiertas</span>
            </div>
          </div>
          <div className="detail-action-btns">
            <button className="btn btn-secondary btn-sm" onClick={() => setShowClientForm(true)}>✏ Editar</button>
            <button className="btn btn-danger btn-sm" onClick={handleDeleteClient}>🗑 Eliminar</button>
          </div>
        </div>
      </div>

      {client.notes && (
        <div className="card detail-notes">
          <strong>Notas:</strong> {client.notes}
        </div>
      )}

      <div className="detail-tabs">
        {['overview', 'policies', 'tasks', 'activity'].map((tab) => (
          <button key={tab} className={`detail-tab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
            {{ overview: 'Resumen', policies: `Pólizas (${policies.length})`, tasks: `Tareas (${tasks.length})`, activity: 'Actividad' }[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="detail-overview">
          <div className="card detail-section">
            <div className="section-header">
              <h3>Pólizas Recientes</h3>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditPolicy(null); setShowPolicyForm(true); }}>+ Póliza</button>
            </div>
            {policies.length === 0 ? (
              <p className="detail-empty">Sin pólizas registradas.</p>
            ) : (
              policies.slice(0, 3).map((p) => <PolicyRow key={p.id} policy={p} fmt={fmt} onDelete={() => handleDeletePolicy(p.id)} onEdit={() => { setEditPolicy(p); setShowPolicyForm(true); }} />)
            )}
          </div>
          <div className="card detail-section">
            <div className="section-header">
              <h3>Tareas Pendientes</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowTaskForm(true)}>+ Tarea</button>
            </div>
            {tasks.filter(t => !t.completed).length === 0 ? (
              <p className="detail-empty">Sin tareas pendientes.</p>
            ) : (
              tasks.filter(t => !t.completed).slice(0, 3).map((t) => (
                <TaskRow key={t.id} task={t} today={today} onToggle={() => toggleTask(t.id)} />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="card detail-section">
          <div className="section-header">
            <h3>Todas las Pólizas</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditPolicy(null); setShowPolicyForm(true); }}>+ Nueva Póliza</button>
          </div>
          {policies.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📋</div><h3>Sin pólizas</h3><p>Agrega la primera póliza de este cliente</p></div>
          ) : (
            policies.map((p) => <PolicyRow key={p.id} policy={p} fmt={fmt} onDelete={() => handleDeletePolicy(p.id)} onEdit={() => { setEditPolicy(p); setShowPolicyForm(true); }} />)
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="card detail-section">
          <div className="section-header">
            <h3>Todas las Tareas</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowTaskForm(true)}>+ Nueva Tarea</button>
          </div>
          {tasks.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">✓</div><h3>Sin tareas</h3><p>Agrega un seguimiento para este cliente</p></div>
          ) : (
            tasks.map((t) => <TaskRow key={t.id} task={t} today={today} onToggle={() => toggleTask(t.id)} />)
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="card detail-section">
          <div className="section-header">
            <h3>Historial de Actividad</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => {
              const text = prompt('Nueva nota de actividad:');
              if (text) addActivity({ type: 'note', clientId: id, clientName: `${client.firstName} ${client.lastName}`, text });
            }}>+ Nota</button>
          </div>
          {clientActivity.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📝</div><h3>Sin actividad</h3></div>
          ) : (
            <div className="activity-timeline">
              {clientActivity.map((a) => (
                <div key={a.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-text">{a.text}</div>
                    <div className="timeline-date">{a.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showClientForm && <ClientForm client={client} onSave={handleClientSave} onClose={() => setShowClientForm(false)} />}
      {showPolicyForm && <PolicyForm policy={editPolicy} clientId={id} onClose={() => { setShowPolicyForm(false); setEditPolicy(null); }} />}
      {showTaskForm && <TaskForm clientId={id} clientName={`${client.firstName} ${client.lastName}`} onClose={() => setShowTaskForm(false)} />}
    </div>
  );
}

function PolicyRow({ policy, fmt, onDelete, onEdit }) {
  return (
    <div className="policy-row">
      <div className="policy-type-icon">{policy.category === 'Annuity' ? '💰' : '🛡'}</div>
      <div className="policy-info">
        <div className="policy-name">{policy.type} — {policy.carrier}</div>
        <div className="policy-num">#{policy.policyNumber}</div>
        <div className="policy-details">
          <span>{policy.category === 'Annuity' ? `Valor: ${fmt(policy.faceValue)}` : `Cobertura: ${fmt(policy.faceValue)}`}</span>
          {policy.annualPremium > 0 && <span>Prima: {fmt(policy.annualPremium)}/año</span>}
          <span>Emitida: {policy.issueDate}</span>
        </div>
      </div>
      <div className="policy-row-right">
        <Badge label={policy.status} />
        <div className="row-actions">
          <button className="btn-icon" onClick={onEdit} title="Editar">✏</button>
          <button className="btn-icon btn-icon-danger" onClick={onDelete} title="Eliminar">🗑</button>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, today, onToggle }) {
  return (
    <div className={`task-row${task.completed ? ' task-done' : ''}${!task.completed && task.dueDate < today ? ' task-overdue-row' : ''}`}>
      <button className={`task-check${task.completed ? ' checked' : ''}`} onClick={onToggle}>
        {task.completed ? '✓' : ''}
      </button>
      <div className="task-row-info">
        <div className="task-row-title">{task.title}</div>
        <div className="task-row-meta">
          <Badge label={task.priority} size="sm" />
          <span className={`task-row-date${!task.completed && task.dueDate < today ? ' overdue' : ''}`}>
            {!task.completed && task.dueDate < today ? '⚠ Vencida: ' : ''}{task.dueDate}
          </span>
        </div>
      </div>
    </div>
  );
}
