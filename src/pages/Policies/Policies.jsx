import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext';
import Badge from '../../components/shared/Badge';
import PolicyForm from './PolicyForm';
import './Policies.css';

export default function Policies() {
  const { policies, clients, deletePolicy } = useCRM();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editPolicy, setEditPolicy] = useState(null);
  const [catFilter, setCatFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todas');

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const getClientName = (clientId) => {
    const c = clients.find((c) => c.id === clientId);
    return c ? `${c.firstName} ${c.lastName}` : '—';
  };

  const filtered = policies.filter((p) => {
    const matchCat = catFilter === 'Todas' || p.category === catFilter;
    const matchStatus = statusFilter === 'Todas' || p.status === statusFilter;
    return matchCat && matchStatus;
  });

  const totalActivePremium = policies.filter(p => p.status === 'Active').reduce((s, p) => s + (p.annualPremium || 0), 0);
  const totalFaceValue = policies.filter(p => p.status === 'Active' && p.category === 'Life Insurance').reduce((s, p) => s + (p.faceValue || 0), 0);
  const totalAnnuityValue = policies.filter(p => p.status === 'Active' && p.category === 'Annuity').reduce((s, p) => s + (p.faceValue || 0), 0);

  return (
    <div className="policies-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pólizas</h1>
          <p className="page-subtitle">{policies.length} pólizas totales</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditPolicy(null); setShowForm(true); }}>
          + Nueva Póliza
        </button>
      </div>

      <div className="policies-stats">
        <div className="pol-stat card">
          <div className="pol-stat-label">Prima Anual Total</div>
          <div className="pol-stat-value">{fmt(totalActivePremium)}</div>
        </div>
        <div className="pol-stat card">
          <div className="pol-stat-label">Cobertura de Vida Total</div>
          <div className="pol-stat-value">{fmt(totalFaceValue)}</div>
        </div>
        <div className="pol-stat card">
          <div className="pol-stat-label">Valor en Anualidades</div>
          <div className="pol-stat-value">{fmt(totalAnnuityValue)}</div>
        </div>
        <div className="pol-stat card">
          <div className="pol-stat-label">Pólizas Activas</div>
          <div className="pol-stat-value">{policies.filter(p => p.status === 'Active').length}</div>
        </div>
      </div>

      <div className="card policies-toolbar">
        <div className="status-filters">
          {['Todas', 'Life Insurance', 'Annuity'].map((f) => (
            <button key={f} className={`filter-btn${catFilter === f ? ' active' : ''}`} onClick={() => setCatFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="status-filters">
          {['Todas', 'Active', 'Pending', 'Issued', 'Lapsed', 'Cancelled'].map((f) => (
            <button key={f} className={`filter-btn${statusFilter === f ? ' active' : ''}`} onClick={() => setStatusFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">📋</div><h3>Sin pólizas</h3><p>Agrega la primera póliza</p></div></div>
      ) : (
        <div className="card policies-table">
          <table className="table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Carrier</th>
                <th>Cobertura / Valor</th>
                <th>Prima Anual</th>
                <th>Emisión</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="table-row" onClick={() => navigate(`/clients/${p.clientId}`)}>
                  <td>
                    <div className="policy-type-cell">
                      <span>{p.category === 'Annuity' ? '💰' : '🛡'}</span>
                      <div>
                        <div className="policy-type-name">{p.type}</div>
                        <div className="policy-cat">{p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="policy-client-name">{getClientName(p.clientId)}</td>
                  <td>{p.carrier}</td>
                  <td>{fmt(p.faceValue)}</td>
                  <td>{p.annualPremium > 0 ? fmt(p.annualPremium) : '—'}</td>
                  <td>{p.issueDate}</td>
                  <td><Badge label={p.status} /></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn-icon" onClick={() => { setEditPolicy(p); setShowForm(true); }} title="Editar">✏</button>
                      <button className="btn-icon btn-icon-danger" onClick={() => { if (window.confirm('¿Eliminar póliza?')) deletePolicy(p.id); }} title="Eliminar">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <PolicyForm policy={editPolicy} onClose={() => { setShowForm(false); setEditPolicy(null); }} />}
    </div>
  );
}
