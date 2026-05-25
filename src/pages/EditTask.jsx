import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../context/ToastContext';
import { academicAPI } from '../services/api';
import { Edit2, Loader2, X } from 'lucide-react';

const EditTask = ({ isOpen, onClose, onSuccess, taskId }) => {
  const [formData, setFormData] = useState({ title: '', date: '', hour: '', minute: '' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && taskId) {
      academicAPI.getTasks()
        .then(res => {
          const task = res.find(t => t.id === taskId);
          if (task) {
            let yyyymmdd = '';
            let hr = '';
            let min = '';
            if (task.dueDate) {
              const d = new Date(task.dueDate);
              if (!isNaN(d.getTime())) {
                yyyymmdd = d.toISOString().split('T')[0];
                hr = d.getHours().toString();
                min = d.getMinutes().toString();
              }
            }
            setFormData({ title: task.title, date: yyyymmdd, hour: hr, minute: min });
          } else {
            addToast('Tarea no encontrada', 'error');
            onClose();
          }
        })
        .catch(err => addToast(err.message, 'error'));
    }
  }, [isOpen, taskId, addToast, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || formData.hour === '' || formData.minute === '') {
      addToast('Llene todos los campos', 'error');
      return;
    }
    setLoading(true);
    try {
      const dueDate = `${formData.date}T${String(formData.hour).padStart(2, '0')}:${String(formData.minute).padStart(2, '0')}:00`;
      await academicAPI.updateTask(taskId, { title: formData.title, dueDate });
      addToast('Tarea actualizada', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%' }}>
        <button className="icon-btn" onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <X size={20} />
        </button>
        <h2 className="section-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Edit2 size={20} /> Editar Tarea
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Título de la Tarea</label>
            <input type="text" className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Fecha de Entrega</label>
              <input type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="input-group" style={{ width: '160px' }}>
              <label className="input-label">Hora de entrega</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="number" min="0" max="23" className="input-field" style={{ padding: '0.5rem', textAlign: 'center' }} value={formData.hour} onChange={e => setFormData({...formData, hour: e.target.value})} placeholder="00" />
                <span style={{ fontWeight: 'bold' }}>:</span>
                <input type="number" min="0" max="59" className="input-field" style={{ padding: '0.5rem', textAlign: 'center' }} value={formData.minute} onChange={e => setFormData({...formData, minute: e.target.value})} placeholder="00" />
              </div>
            </div>
          </div>
          <div className="modal-actions" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><Loader2 className="spinner" /> Procesando...</> : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditTask;
