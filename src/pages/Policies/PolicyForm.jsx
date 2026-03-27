import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import Modal from '../../components/shared/Modal';

const defaultForm = {
  type: 'Term', category: 'Life Insurance', carrier: '',
  policyNumber: '', faceValue: '', annualPremium: '',
  issueDate: '', status: 'Active', notes: '',
};

const LIFE_TYPES = ['Term', 'Whole Life', 'Universal Life', 'Variable Life', 'Indexed Universal Life'];
const ANNUITY_TYPES = ['Fixed Annuity', 'Variable Annuity', 'Indexed Annuity', 'Immediate Annuity', 'Deferred Income Annuity'];

export default function PolicyForm({ policy, clientId, onClose }) {
  const { addPolicy, updatePolicy, clients } = useCRM();
  const [form, setForm] = useState(policy ? {
    type: policy.type, category: policy.category, carrier: policy.carrier,
    policyNumber: policy.policyNumber, faceValue: policy.faceValue,
    annualPremium: policy.annualPremium, issueDate: policy.issueDate,
    status: policy.status, notes: policy.notes || '',
    clientId: policy.clientId,
  } : { ...defaultForm, clientId: clientId || '' });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const types = form.category === 'Annuity' ? ANNUITY_TYPES : LIFE_TYPES;

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setForm((f) => ({ ...f, category: cat, type: cat === 'Annuity' ? ANNUITY_TYPES[0] : LIFE_TYPES[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, faceValue: Number(form.faceValue) || 0, annualPremium: Number(form.annualPremium) || 0 };
    if (policy) {
      updatePolicy(policy.id, data);
    } else {
      addPolicy(data);
    }
    onClose();
  };

  return (
    <Modal title={policy ? 'Editar Póliza' : 'Nueva Póliza'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="client-form-grid">
          {!clientId && !policy && (
            <div className="form-group client-form-full">
              <label className="form-label">Cliente *</label>
              <select className="form-input" value={form.clientId} onChange={set('clientId')} required>
                <option value="">Seleccionar cliente...</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select className="form-input" value={form.category} onChange={handleCategoryChange}>
              <option>Life Insurance</option>
              <option>Annuity</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tipo de Producto</label>
            <select className="form-input" value={form.type} onChange={set('type')}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Aseguradora / Carrier *</label>
            <input className="form-input" value={form.carrier} onChange={set('carrier')} placeholder="Ej. Northwestern Mutual" required />
          </div>
          <div className="form-group">
            <label className="form-label">Número de Póliza</label>
            <input className="form-input" value={form.policyNumber} onChange={set('policyNumber')} placeholder="Ej. NM-2024-001234" />
          </div>
          <div className="form-group">
            <label className="form-label">{form.category === 'Annuity' ? 'Valor / Depósito ($)' : 'Cobertura / Face Value ($)'}</label>
            <input className="form-input" type="number" min="0" value={form.faceValue} onChange={set('faceValue')} placeholder="500000" />
          </div>
          <div className="form-group">
            <label className="form-label">Prima Anual ($)</label>
            <input className="form-input" type="number" min="0" value={form.annualPremium} onChange={set('annualPremium')} placeholder="1200" />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha de Emisión</label>
            <input className="form-input" type="date" value={form.issueDate} onChange={set('issueDate')} />
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-input" value={form.status} onChange={set('status')}>
              <option>Active</option>
              <option>Pending</option>
              <option>Issued</option>
              <option>Lapsed</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div className="form-group client-form-full">
            <label className="form-label">Notas</label>
            <textarea className="form-input" value={form.notes} onChange={set('notes')} rows={2} placeholder="Riders, condiciones especiales..." />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{policy ? 'Guardar Cambios' : 'Crear Póliza'}</button>
        </div>
      </form>
    </Modal>
  );
}
