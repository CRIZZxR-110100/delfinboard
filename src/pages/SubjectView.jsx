import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { academicAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { BookOpen, CheckSquare, Calculator, Edit2, Loader2, Calendar, ArrowLeft, Plus } from 'lucide-react';

const SubjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [subject, setSubject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [subjectsData, tasksData] = await Promise.all([
        academicAPI.getSubjects(),
        academicAPI.getTasks()
      ]);
      const foundSub = subjectsData.find(s => s.id === id);
      if (!foundSub) {
        addToast('Materia no encontrada', 'error');
        navigate('/materias');
        return;
      }
      setSubject(foundSub);

      const subTasks = tasksData
        .filter(t => t.subjectId === id)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setTasks(subTasks);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await academicAPI.updateTaskStatus(task.id, newStatus);
      fetchData(); // reload
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Loader2 className="spinner" size={32} />
      </div>
    );
  }

  if (!subject) return null;

  const capturedCount = subject.partials ? subject.partials.filter(p => p.grade !== null).length : 0;
  const isFinished = capturedCount >= subject.totalPartials;
  const isApproved = subject.finalGrade >= 70;

  return (
    <div className="dashboard fade-in">
      <button className="btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem', width: 'fit-content' }}>
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Header Panel */}
      <div className="glass-panel p-4" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                <BookOpen size={28} color="hsl(var(--primary))" /> {subject.name}
              </h1>
              <button 
                onClick={() => navigate(`/materia/editar/${subject.id}`)} 
                className="icon-btn" 
                title="Editar Materia" 
                style={{ background: 'hsla(0,0%,50%,0.1)' }}
              >
                <Edit2 size={16} />
              </button>
            </div>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>
              Materia de Nivel Superior | Seguimiento Semestral
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'hsl(var(--text-main))', lineHeight: '1' }}>
              {subject.finalGrade} <span style={{ fontSize: '1rem', color: 'hsl(var(--text-muted))' }}>/ 100</span>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              {!isFinished && subject.finalGrade < 70 ? (
                <span className="badge" style={{ background: 'hsl(var(--primary))', color: '#fff' }}>EN CURSO ({capturedCount}/{subject.totalPartials})</span>
              ) : (
                <span className={`badge ${isApproved ? 'badge-success' : 'badge-danger'}`}>
                  {isApproved ? 'APROBADA' : 'REPROBADA'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Calificaciones Panel */}
        <div className="glass-panel p-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}><Calculator size={20} /> Calificaciones</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(!subject.partials || subject.partials.length === 0) ? (
              <p className="text-muted text-center" style={{ margin: '2rem 0' }}>No hay secuencias registradas.</p>
            ) : (
              subject.partials.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsl(var(--bg-base))', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)'}}>
                  <div style={{ fontWeight: '500' }}>{p.partialName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{p.grade !== null ? `${p.grade} pts` : '-'}</span>
                    <button onClick={() => navigate(`/calificacion/editar/${p.id}`)} className="icon-btn" style={{ background: 'hsla(0,0%,50%,0.1)' }} title="Editar">
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tareas Panel */}
        <div className="glass-panel p-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}><CheckSquare size={20} /> Tareas de la Materia</h2>
            <button onClick={() => navigate(`/tarea/nueva?subjectId=${subject.id}`)} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>
              <Plus size={16} /> Añadir Tarea
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.length === 0 ? (
              <p className="text-muted text-center" style={{ margin: '2rem 0' }}>No hay tareas vinculadas.</p>
            ) : (
              tasks.map(task => {
                const isCompleted = task.status === 'completed';
                const d = new Date(task.dueDate);
                return (
                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsl(var(--bg-base))', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', opacity: isCompleted ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input 
                        type="checkbox" 
                        checked={isCompleted} 
                        onChange={() => toggleTaskStatus(task)}
                        style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: 'hsl(var(--primary))' }}
                      />
                      <div>
                        <p style={{ margin: 0, fontWeight: '600', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                          {task.title}
                        </p>
                        <small className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <Calendar size={12}/> {d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                        </small>
                      </div>
                    </div>
                    <div>
                      <button onClick={() => navigate(`/tarea/editar/${task.id}`)} className="icon-btn" style={{ background: 'hsla(0,0%,50%,0.1)' }} title="Editar">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SubjectView;
