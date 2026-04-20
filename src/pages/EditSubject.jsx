import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { academicAPI } from '../services/api';
import { Edit2, ArrowLeft, Loader2 } from 'lucide-react';

const EditSubject = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ name: '', totalPartials: 3 });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    academicAPI.getSubjects()
      .then(res => {
        const subject = res.find(s => s.id === id);
        if (subject) {
          setFormData({ name: subject.name, totalPartials: subject.totalPartials });
        } else {
          addToast('Materia no encontrada', 'error');
          navigate(-1);
        }
      })
      .catch(err => addToast(err.message, 'error'));
  }, [id, addToast, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.totalPartials) {
      addToast('Llene todos los campos', 'error');
      return;
    }
    setLoading(true);
    try {
      await academicAPI.updateSubject(id, formData);
      addToast('Materia actualizada', 'success');
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
        <h2 className="section-title"><Edit2 size={20} /> Editar Materia</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Nombre de la Materia</label>
            <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Cantidad Total de Secuencias</label>
            <input type="number" min="1" className="input-field" value={formData.totalPartials} onChange={e => setFormData({...formData, totalPartials: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><Loader2 className="spinner" /> Procesando...</> : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditSubject;
