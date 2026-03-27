import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext';
import './Pipeline.css';

const STAGES = ['Lead', 'Prospect', 'Quote Sent', 'Application Submitted', 'Issued', 'Active'];

const STAGE_COLORS = {
  'Lead': '#64748b',
  'Prospect': '#d97706',
  'Quote Sent': '#7c3aed',
  'Application Submitted': '#2563eb',
  'Issued': '#ea580c',
  'Active': '#16a34a',
};

export default function Pipeline() {
  const { pipeline, movePipelineItem, addPipelineItem, deletePipelineItem, clients } = useCRM();
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(null); // { itemId, fromStage }
  const [dragOver, setDragOver] = useState(null);
  const [showAddForm, setShowAddForm] = useState(null); // stage name

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const totalValue = Object.values(pipeline).reduce((s, stage) =>
    s + stage.items.reduce((ss, item) => ss + (item.potentialPremium || 0), 0), 0);

  const handleDragStart = (itemId, fromStage) => {
    setDragging({ itemId, fromStage });
  };

  const handleDrop = (toStage) => {
    if (dragging && dragging.fromStage !== toStage) {
      movePipelineItem(dragging.itemId, dragging.fromStage, toStage);
    }
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div className="pipeline-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pipeline de Ventas</h1>
          <p className="page-subtitle">Valor total del pipeline: {fmt(totalValue)}/año en primas potenciales</p>
        </div>
      </div>

      <div className="pipeline-board">
        {STAGES.map((stage) => {
          const stageData = pipeline[stage] || { items: [] };
          const stageValue = stageData.items.reduce((s, i) => s + (i.potentialPremium || 0), 0);
          const color = STAGE_COLORS[stage];
          const isDragOver = dragOver === stage;

          return (
            <div
              key={stage}
              className={`pipeline-column${isDragOver ? ' drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(stage)}
            >
              <div className="pipeline-col-header" style={{ borderTopColor: color }}>
                <div className="pipeline-col-title">
                  <span className="pipeline-col-name">{stage}</span>
                  <span className="pipeline-col-count" style={{ background: color }}>{stageData.items.length}</span>
                </div>
                <div className="pipeline-col-value">{fmt(stageValue)}</div>
              </div>

              <div className="pipeline-cards">
                {stageData.items.map((item) => (
                  <div
                    key={item.id}
                    className="pipeline-card"
                    draggable
                    onDragStart={() => handleDragStart(item.id, stage)}
                    onDragEnd={() => { setDragging(null); setDragOver(null); }}
                    style={{ opacity: dragging?.itemId === item.id ? 0.5 : 1 }}
                  >
                    <div className="pipeline-card-header">
                      <div className="pipeline-card-name"
                        onClick={() => item.clientId && navigate(`/clients/${item.clientId}`)}
                        style={{ cursor: item.clientId ? 'pointer' : 'default' }}
                      >
                        {item.clientName}
                      </div>
                      <button className="pipeline-card-delete"
                        onClick={() => { if (window.confirm('¿Eliminar del pipeline?')) deletePipelineItem(stage, item.id); }}
                        title="Eliminar"
                      >✕</button>
                    </div>
                    <div className="pipeline-card-product">{item.productInterest}</div>
                    <div className="pipeline-card-premium">
                      {fmt(item.potentialPremium || 0)}<span>/año</span>
                    </div>
                    <div className="pipeline-card-stage-btns">
                      {STAGES.indexOf(stage) > 0 && (
                        <button className="stage-btn stage-btn-prev"
                          onClick={() => movePipelineItem(item.id, stage, STAGES[STAGES.indexOf(stage) - 1])}
                          title="Retroceder etapa"
                        >← Atrás</button>
                      )}
                      {STAGES.indexOf(stage) < STAGES.length - 1 && (
                        <button className="stage-btn stage-btn-next"
                          onClick={() => movePipelineItem(item.id, stage, STAGES[STAGES.indexOf(stage) + 1])}
                          title="Avanzar etapa"
                        >Avanzar →</button>
                      )}
                    </div>
                  </div>
                ))}

                {showAddForm === stage ? (
                  <AddItemForm
                    stage={stage}
                    clients={clients}
                    onAdd={(item) => { addPipelineItem(stage, item); setShowAddForm(null); }}
                    onCancel={() => setShowAddForm(null)}
                  />
                ) : (
                  <button className="pipeline-add-btn" onClick={() => setShowAddForm(stage)}>
                    + Agregar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddItemForm({ stage, clients, onAdd, onCancel }) {
  const [form, setForm] = useState({ clientId: '', clientName: '', productInterest: '', potentialPremium: '' });
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleClientChange = (e) => {
    const id = e.target.value;
    const c = clients.find((c) => c.id === id);
    setForm((f) => ({ ...f, clientId: id, clientName: c ? `${c.firstName} ${c.lastName}` : '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.clientName.trim()) return;
    onAdd({ ...form, potentialPremium: Number(form.potentialPremium) || 0 });
  };

  return (
    <form className="pipeline-add-form" onSubmit={handleSubmit}>
      <select className="form-input" value={form.clientId} onChange={handleClientChange}>
        <option value="">Seleccionar cliente...</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
      </select>
      {!form.clientId && (
        <input className="form-input" placeholder="O nombre libre..." value={form.clientName} onChange={set('clientName')} />
      )}
      <input className="form-input" placeholder="Producto (ej: Term Life 20yr)" value={form.productInterest} onChange={set('productInterest')} />
      <input className="form-input" type="number" placeholder="Prima potencial/año $" value={form.potentialPremium} onChange={set('potentialPremium')} />
      <div className="pipeline-add-form-btns">
        <button type="submit" className="btn btn-primary btn-sm">Agregar</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
