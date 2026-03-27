import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext';
import Badge from '../../components/shared/Badge';
import ClientForm from './ClientForm';
import './Clients.css';

const STATUS_FILTERS = ['Todos', 'Lead', 'Prospect', 'Client', 'Inactive'];

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useCRM();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState(null);

  const filtered = clients.filter((c) => {
    const matchSearch = `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Todos' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = (data) => {
    if (editClient) {
      updateClient(editClient.id, data);
    } else {
      addClient(data);
    }
    setShowForm(false);
    setEditClient(null);
  };

  const handleEdit = (e, client) => {
    e.stopPropagation();
    setEditClient(client);
    setShowForm(true);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar este cliente y todas sus pólizas y tareas?')) {
      deleteClient(id);
    }
  };

  const calcAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <div className="clients-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">{clients.length} clientes en total</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditClient(null); setShowForm(true); }}>
          + Nuevo Cliente
        </button>
      </div>

      <div className="clients-toolbar card">
        <input
          className="form-input clients-search"
          placeholder="🔍  Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="status-filters">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`filter-btn${statusFilter === s ? ' active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
              {s !== 'Todos' && (
                <span className="filter-count">
                  {clients.filter((c) => c.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No se encontraron clientes</h3>
            <p>Intenta cambiar los filtros o agrega un nuevo cliente</p>
          </div>
        </div>
      ) : (
        <div className="clients-table card">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Edad</th>
                <th>Estado</th>
                <th>Último Contacto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="table-row" onClick={() => navigate(`/clients/${c.id}`)}>
                  <td>
                    <div className="client-name-cell">
                      <div className="client-avatar">{c.firstName[0]}{c.lastName[0]}</div>
                      <div>
                        <div className="client-name">{c.firstName} {c.lastName}</div>
                        <div className="client-since">Cliente desde {c.createdAt?.split('-')[0]}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="client-contact">
                      <div>{c.phone}</div>
                      <div className="client-email">{c.email}</div>
                    </div>
                  </td>
                  <td>{calcAge(c.dateOfBirth) ? `${calcAge(c.dateOfBirth)} años` : '—'}</td>
                  <td><Badge label={c.status} /></td>
                  <td>{c.lastContact || '—'}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn-icon" onClick={(e) => handleEdit(e, c)} title="Editar">✏</button>
                      <button className="btn-icon btn-icon-danger" onClick={(e) => handleDelete(e, c.id)} title="Eliminar">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ClientForm
          client={editClient}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditClient(null); }}
        />
      )}
    </div>
  );
}
