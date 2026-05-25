import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../context/ToastContext';
import { academicAPI } from '../services/api';
import { Edit2, Loader2, X } from 'lucide-react';

const EditSubject = ({ isOpen, onClose, onSuccess, subjectId }) => {
  const [formData, setFormData] = useState({ name: '', totalPartials: 3 });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && subjectId) {
      academicAPI.getSubjects()
        .then(res => {
          const subject = res.find(s => s.id === subjectId);
          if (subject) {
            setFormData({ name: subject.name, totalPartials: subject.totalPartials });
          } else {
            addToast('Materia no encontrada', 'error');
            onClose();
          }
        })
        .catch(err => addToast(err.message, 'error'));
    }
  }, [isOpen, subjectId, addToast, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.totalPartials) {
      addToast('Llene todos los campos', 'error');
      return;
    }
    setLoading(true);
    try {
      await academicAPI.updateSubject(subjectId, formData);
      addToast('Materia actualizada', 'success');
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
          <Edit2 size={20} /> Editar Materia
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Nombre de la Materia</label>
            <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Cantidad Total de Secuencias</label>
            <input type="number" min="1" className="input-field" value={formData.totalPartials} onChange={e => setFormData({...formData, totalPartials: e.target.value})} />
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

export default EditSubject;
