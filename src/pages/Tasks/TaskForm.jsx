import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import Modal from '../../components/shared/Modal';

const defaultForm = {
  title: '', clientId: '', dueDate: '', priority: 'Medium', notes: '',
};

export default function TaskForm({ task, clientId, clientName, onClose }) {
  const { addTask, updateTask, clients } = useCRM();
  const [form, setForm] = useState(task ? {
    title: task.title, clientId: task.clientId, dueDate: task.dueDate,
    priority: task.priority, notes: task.notes || '',
  } : { ...defaultForm, clientId: clientId || '', clientName: clientName || '' });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (task) {
      updateTask(task.id, form);
    } else {
      addTask(form);
    }
    onClose();
  };

  return (
    <Modal title={task ? 'Editar Tarea' : 'Nueva Tarea'} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Título de la Tarea *</label>
            <input className="form-input" value={form.title} onChange={set('title')} placeholder="Ej: Llamar para seguimiento de cotización" required />
          </div>
          {!clientId && (
            <div className="form-group">
              <label className="form-label">Cliente</label>
              <select className="form-input" value={form.clientId} onChange={set('clientId')}>
                <option value="">Sin cliente específico</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Fecha Límite</label>
              <input className="form-input" type="date" value={form.dueDate} onChange={set('dueDate')} />
            </div>
            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <select className="form-input" value={form.priority} onChange={set('priority')}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notas</label>
            <textarea className="form-input" value={form.notes} onChange={set('notes')} rows={3} placeholder="Detalles adicionales..." />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{task ? 'Guardar' : 'Crear Tarea'}</button>
        </div>
      </form>
    </Modal>
  );
}
