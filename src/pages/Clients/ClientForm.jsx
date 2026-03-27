import React, { useState } from 'react';
import Modal from '../../components/shared/Modal';
import './ClientForm.css';

const defaultForm = {
  firstName: '', lastName: '', phone: '', email: '',
  dateOfBirth: '', address: '', status: 'Lead', notes: '',
};

export default function ClientForm({ client, onSave, onClose }) {
  const [form, setForm] = useState(client ? {
    firstName: client.firstName,
    lastName: client.lastName,
    phone: client.phone,
    email: client.email,
    dateOfBirth: client.dateOfBirth || '',
    address: client.address || '',
    status: client.status,
    notes: client.notes || '',
  } : { ...defaultForm });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    onSave(form);
  };

  return (
    <Modal title={client ? 'Editar Cliente' : 'Nuevo Cliente'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="client-form-grid">
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input className="form-input" value={form.firstName} onChange={set('firstName')} placeholder="Nombre" required />
          </div>
          <div className="form-group">
            <label className="form-label">Apellido *</label>
            <input className="form-input" value={form.lastName} onChange={set('lastName')} placeholder="Apellido" required />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="email@ejemplo.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha de Nacimiento</label>
            <input className="form-input" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-input" value={form.status} onChange={set('status')}>
              <option>Lead</option>
              <option>Prospect</option>
              <option>Client</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="form-group client-form-full">
            <label className="form-label">Dirección</label>
            <input className="form-input" value={form.address} onChange={set('address')} placeholder="Dirección completa" />
          </div>
          <div className="form-group client-form-full">
            <label className="form-label">Notas</label>
            <textarea className="form-input" value={form.notes} onChange={set('notes')} placeholder="Notas sobre el cliente..." rows={3} />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary">
            {client ? 'Guardar Cambios' : 'Crear Cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
