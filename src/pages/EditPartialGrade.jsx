import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../context/ToastContext';
import { academicAPI } from '../services/api';
import { Edit2, Loader2, X } from 'lucide-react';

const EditPartialGrade = ({ isOpen, onClose, onSuccess, gradeId }) => {
  const [formData, setFormData] = useState({ grade: '' });
  const [metadata, setMetadata] = useState({ subjectName: '', partialName: '' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && gradeId) {
      academicAPI.getSubjects()
        .then(res => {
          let found = false;
          for (const sub of res) {
            const partial = sub.partials?.find(p => p.id === gradeId);
            if (partial) {
              setFormData({ grade: partial.grade !== null ? partial.grade : '' });
              setMetadata({ subjectName: sub.name, partialName: partial.partialName });
              found = true;
              break;
            }
          }
          if (!found) {
            addToast('Calificación no encontrada', 'error');
            onClose();
          }
        })
        .catch(err => addToast(err.message, 'error'));
    }
  }, [isOpen, gradeId, addToast, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.grade === '') {
      addToast('Ingrese la calificación', 'error');
      return;
    }
    setLoading(true);
    try {
      await academicAPI.updatePartialGrade(gradeId, formData);
      addToast('Calificación actualizada', 'success');
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
          <Edit2 size={20} /> Editar Calificación ({metadata.partialName})
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Materia</label>
            <input type="text" className="input-field" value={metadata.subjectName} disabled />
          </div>
          <div className="input-group">
            <label className="input-label">Calificación (Puntos Exactos)</label>
            <input type="number" step="0.1" className="input-field" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} />
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

export default EditPartialGrade;
