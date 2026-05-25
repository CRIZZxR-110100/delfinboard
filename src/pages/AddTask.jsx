import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../context/ToastContext';
import { academicAPI } from '../services/api';
import { CheckSquare, Loader2, X } from 'lucide-react';

const AddTask = ({ isOpen, onClose, onSuccess, initialSubjectId = '' }) => {
  const [formData, setFormData] = useState({ subjectId: initialSubjectId, title: '', date: '', hour: '23', minute: '59' });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      academicAPI.getSubjects()
        .then(res => setSubjects(res))
        .catch(err => addToast(err.message, 'error'));
        
      setFormData(prev => ({ ...prev, subjectId: initialSubjectId }));
    }
  }, [isOpen, initialSubjectId, addToast]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.title || !formData.date || formData.hour === '' || formData.minute === '') {
      addToast('Llene todos los campos', 'error');
      return;
    }
    setLoading(true);
    try {
      // Compose dueDate
      const dueDate = `${formData.date}T${String(formData.hour).padStart(2, '0')}:${String(formData.minute).padStart(2, '0')}:00`;
      
      await academicAPI.addTask({
        subjectId: formData.subjectId,
        title: formData.title,
        dueDate
      });
      addToast('Tarea agregada', 'success');
      setFormData({ subjectId: initialSubjectId, title: '', date: '', hour: '23', minute: '59' });
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
          <CheckSquare size={20} /> Registrar Nueva Tarea
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Materia Receptora</label>
            <select className="input-field" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>
              <option value="">Selecciona materia...</option>
              {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Título de la Tarea</label>
            <input type="text" className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ej. Investigación de Sistemas" />
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
              {loading ? <><Loader2 className="spinner" /> Procesando...</> : 'Guardar Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddTask;
