import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { academicAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { BookOpen, PlusCircle, Edit2, Loader2, ArrowRight } from 'lucide-react';

const SubjectsList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await academicAPI.getSubjects();
      setSubjects(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={28} color="hsl(var(--primary))" /> Gestión de Materias
          </h1>
          <p className="text-muted">Administra tu carga académica, registra nuevas materias o modifica las existentes.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/materia/nueva')}>
          <PlusCircle size={18} /> Nueva Materia
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="spinner" size={32} />
        </div>
      ) : (
        <div className="table-container glass-panel p-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre de la Materia</th>
                <th>Avance Parcial</th>
                <th>Calificación Final</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">No tienes materias registradas en este semestre.</td>
                </tr>
              ) : (
                subjects.map(sub => {
                  const capturedCount = sub.partials ? sub.partials.filter(p => p.grade !== null).length : 0;
                  const isFinished = capturedCount >= sub.totalPartials;
                  const isApproved = sub.finalGrade >= 70;

                  return (
                    <tr 
                      key={sub.id} 
                      onClick={() => navigate(`/materia/ver/${sub.id}`)}
                      style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: '600', color: 'hsl(var(--text-main))' }}>
                        {sub.name}
                      </td>
                      <td>{capturedCount} / {sub.totalPartials} secuencias</td>
                      <td><strong>{sub.finalGrade} pto</strong></td>
                      <td>
                        {!isFinished && sub.finalGrade < 70 ? (
                          <span className="badge" style={{ background: 'hsl(var(--primary))', color: '#fff', display: 'inline-block', textAlign: 'left' }}>EN CURSO</span>
                        ) : (
                          <span className={`badge ${isApproved ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-block', textAlign: 'left' }}>
                            {isApproved ? 'APROBADA' : 'REPROBADA'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubjectsList;
