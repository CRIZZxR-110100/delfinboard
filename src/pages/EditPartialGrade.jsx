import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { academicAPI } from '../services/api';
import { Edit2, ArrowLeft, Loader2 } from 'lucide-react';

const EditPartialGrade = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ grade: '' });
  const [metadata, setMetadata] = useState({ subjectName: '', partialName: '' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    academicAPI.getSubjects()
      .then(res => {
        let found = false;
        for (const sub of res) {
          const partial = sub.partials?.find(p => p.id === id);
          if (partial) {
            setFormData({ grade: partial.grade !== null ? partial.grade : '' });
            setMetadata({ subjectName: sub.name, partialName: partial.partialName });
            found = true;
            break;
          }
        }
        if (!found) {
          addToast('Calificación no encontrada', 'error');
          navigate(-1);
        }
      })
      .catch(err => addToast(err.message, 'error'));
  }, [id, addToast, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.grade === '') {
      addToast('Ingrese la calificación', 'error');
      return;
    }
    setLoading(true);
    try {
      await academicAPI.updatePartialGrade(id, formData);
      addToast('Calificación actualizada', 'success');
      navigate(-1);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard fade-in" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <button className="btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '1rem', width: 'fit-content' }}>
        <ArrowLeft size={16} /> Volver
      </button>
      <div className="glass-panel p-4">
        <h2 className="section-title"><Edit2 size={20} /> Editar Calificación ({metadata.partialName})</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Materia</label>
            <input type="text" className="input-field" value={metadata.subjectName} disabled />
          </div>
          <div className="input-group">
            <label className="input-label">Calificación (Puntos Exactos)</label>
            <input type="number" step="0.1" className="input-field" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><Loader2 className="spinner" /> Procesando...</> : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPartialGrade;
