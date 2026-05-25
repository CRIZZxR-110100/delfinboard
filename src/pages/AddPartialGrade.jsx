import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../context/ToastContext';
import { academicAPI } from '../services/api';
import { Calculator, Loader2, X } from 'lucide-react';

const AddPartialGrade = ({ isOpen, onClose, onSuccess, initialSubjectId = '' }) => {
  const [formData, setFormData] = useState({ subjectId: initialSubjectId, partialName: '', grade: '' });
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
    if (!formData.subjectId || !formData.partialName || !formData.grade) {
      addToast('Llene todos los campos', 'error');
      return;
    }
    setLoading(true);
    try {
      await academicAPI.addPartialGrade(formData);
      addToast('Calificación parcial agregada', 'success');
      setFormData({ subjectId: initialSubjectId, partialName: '', grade: '' });
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
          <Calculator size={20} /> Registrar Calificación Parcial
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Materia</label>
            <select className="input-field" value={formData.subjectId} onChange={e => {
              setFormData({...formData, subjectId: e.target.value, partialName: ''});
            }}>
              <option value="">Selecciona materia...</option>
              {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Secuencia</label>
            <select className="input-field" value={formData.partialName} onChange={e => setFormData({...formData, partialName: e.target.value})} disabled={!formData.subjectId}>
              <option value="">Selecciona secuencia...</option>
              {formData.subjectId && Array.from({length: subjects.find(s => s.id === formData.subjectId)?.totalPartials || 0}, (_, i) => i + 1).map(p => (
                <option key={p} value={`Secuencia ${p}`}>Secuencia {p}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Calificación (Puntos)</label>
            <input type="number" step="0.1" className="input-field" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} placeholder="Ej. 25.5" />
          </div>
          <div className="modal-actions" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><Loader2 className="spinner" /> Procesando...</> : 'Guardar Parcial'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddPartialGrade;
