import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { academicAPI } from '../services/api';
import { Calculator, ArrowLeft, Loader2 } from 'lucide-react';

const AddPartialGrade = () => {
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subjectId') || '';
  const [formData, setFormData] = useState({ subjectId: initialSubject, partialName: '', grade: '' });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    academicAPI.getSubjects()
      .then(res => setSubjects(res))
      .catch(err => addToast(err.message, 'error'));
  }, []);

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
        <h2 className="section-title"><Calculator size={20} /> Registrar Calificación Parcial</h2>
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
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><Loader2 className="spinner" /> Procesando...</> : 'Guardar Parcial'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPartialGrade;
