import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { academicAPI } from '../services/api';
import { Edit2, ArrowLeft, Loader2 } from 'lucide-react';

const EditTask = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ title: '', date: '', hour: '', minute: '' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    academicAPI.getTasks()
      .then(res => {
        const task = res.find(t => t.id === id);
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
          navigate(-1);
        }
      })
      .catch(err => addToast(err.message, 'error'));
  }, [id, addToast, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || formData.hour === '' || formData.minute === '') {
      addToast('Llene todos los campos', 'error');
      return;
    }
    setLoading(true);
    try {
      const dueDate = `${formData.date}T${String(formData.hour).padStart(2, '0')}:${String(formData.minute).padStart(2, '0')}:00`;
      await academicAPI.updateTask(id, { title: formData.title, dueDate });
      addToast('Tarea actualizada', 'success');
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
        <h2 className="section-title"><Edit2 size={20} /> Editar Tarea</h2>
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
              <label className="input-label">Hora exacto</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="number" min="0" max="23" className="input-field" style={{ padding: '0.5rem', textAlign: 'center' }} value={formData.hour} onChange={e => setFormData({...formData, hour: e.target.value})} placeholder="00" />
                <span style={{ fontWeight: 'bold' }}>:</span>
                <input type="number" min="0" max="59" className="input-field" style={{ padding: '0.5rem', textAlign: 'center' }} value={formData.minute} onChange={e => setFormData({...formData, minute: e.target.value})} placeholder="00" />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><Loader2 className="spinner" /> Procesando...</> : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
