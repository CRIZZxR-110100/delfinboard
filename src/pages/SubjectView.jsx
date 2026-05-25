import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { academicAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { BookOpen, CheckSquare, Calculator, Edit2, Loader2, Calendar, X, Plus } from 'lucide-react';

import EditSubject from './EditSubject';
import AddTask from './AddTask';
import EditTask from './EditTask';
import EditPartialGrade from './EditPartialGrade';

const SubjectView = ({ isOpen, onClose, subjectId }) => {
  const { addToast } = useToast();

  const [subject, setSubject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para sub-modales
  const [showEditSubject, setShowEditSubject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showEditGrade, setShowEditGrade] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState(null);

  useEffect(() => {
    if (isOpen && subjectId) {
      fetchData();
    }
  }, [isOpen, subjectId]);

  const fetchData = async () => {
    try {
      const [subjectsData, tasksData] = await Promise.all([
        academicAPI.getSubjects(),
        academicAPI.getTasks()
      ]);
      const foundSub = subjectsData.find(s => s.id === subjectId);
      if (!foundSub) {
        addToast('Materia no encontrada', 'error');
        onClose();
        return;
      }
      setSubject(foundSub);

      const subTasks = tasksData
        .filter(t => t.subjectId === subjectId)
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

  if (!isOpen) return null;

  if (loading || !subject) {
    return createPortal(
      <div className="modal-overlay" style={{ zIndex: 9998 }}>
        <div className="modal glass-panel" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="spinner" size={32} />
        </div>
      </div>,
      document.body
    );
  }

  const capturedCount = subject.partials ? subject.partials.filter(p => p.grade !== null).length : 0;
  const isFinished = capturedCount >= subject.totalPartials;
  const isApproved = subject.finalGrade >= 70;

  return createPortal(
    <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 9998, padding: '2rem' }}>
      <div 
        className="modal glass-panel" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
      >
        <button className="icon-btn" onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <X size={24} />
        </button>

        {/* Header Panel */}
        <div style={{ marginBottom: '2rem', paddingRight: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                  <BookOpen size={28} color="hsl(var(--primary))" /> {subject.name}
                </h1>
                <button 
                  onClick={() => setShowEditSubject(true)} 
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Calificaciones Panel */}
          <div style={{ background: 'hsla(0,0%,50%,0.05)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="section-title" style={{ margin: 0 }}><Calculator size={20} /> Calificaciones</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(!subject.partials || subject.partials.length === 0) ? (
                <p className="text-muted text-center" style={{ margin: '2rem 0' }}>No hay secuencias registradas.</p>
              ) : (
                [...subject.partials]
                  .sort((a, b) => {
                    const numA = parseInt(a.partialName.replace('Secuencia ', '')) || 0;
                    const numB = parseInt(b.partialName.replace('Secuencia ', '')) || 0;
                    return numA - numB;
                  })
                  .map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsl(var(--bg-base))', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)'}}>
                    <div style={{ fontWeight: '500' }}>{p.partialName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{p.grade !== null ? `${p.grade} pts` : '-'}</span>
                      <button onClick={() => { setSelectedGradeId(p.id); setShowEditGrade(true); }} className="icon-btn" style={{ background: 'hsla(0,0%,50%,0.1)' }} title="Editar">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tareas Panel */}
          <div style={{ background: 'hsla(0,0%,50%,0.05)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="section-title" style={{ margin: 0 }}><CheckSquare size={20} /> Tareas de la Materia</h2>
              <button onClick={() => setShowAddTask(true)} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>
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
                        <button onClick={() => { setSelectedTaskId(task.id); setShowEditTask(true); }} className="icon-btn" style={{ background: 'hsla(0,0%,50%,0.1)' }} title="Editar">
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

        {/* Sub-modales */}
        <EditSubject isOpen={showEditSubject} onClose={() => setShowEditSubject(false)} onSuccess={fetchData} subjectId={subjectId} />
        <AddTask isOpen={showAddTask} onClose={() => setShowAddTask(false)} onSuccess={fetchData} initialSubjectId={subjectId} />
        <EditTask isOpen={showEditTask} onClose={() => setShowEditTask(false)} onSuccess={fetchData} taskId={selectedTaskId} />
        <EditPartialGrade isOpen={showEditGrade} onClose={() => setShowEditGrade(false)} onSuccess={fetchData} gradeId={selectedGradeId} />

      </div>
    </div>,
    document.body
  );
};

export default SubjectView;
