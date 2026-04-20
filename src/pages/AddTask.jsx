import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { academicAPI } from '../services/api';
import { CheckSquare, ArrowLeft, Loader2 } from 'lucide-react';

const AddTask = () => {
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subjectId') || '';
  const [formData, setFormData] = useState({ subjectId: initialSubject, title: '', date: '', hour: '', minute: '' });
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
        <h2 className="section-title"><CheckSquare size={20} /> Registrar Nueva Tarea</h2>
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
              <label className="input-label">Hora exacto</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="number" min="0" max="23" className="input-field" style={{ padding: '0.5rem', textAlign: 'center' }} value={formData.hour} onChange={e => setFormData({...formData, hour: e.target.value})} placeholder="00" />
                <span style={{ fontWeight: 'bold' }}>:</span>
                <input type="number" min="0" max="59" className="input-field" style={{ padding: '0.5rem', textAlign: 'center' }} value={formData.minute} onChange={e => setFormData({...formData, minute: e.target.value})} placeholder="00" />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><Loader2 className="spinner" /> Procesando...</> : 'Guardar Tarea'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
