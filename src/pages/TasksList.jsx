import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { academicAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CheckSquare, PlusSquare, Edit2, Loader2, Calendar, X } from 'lucide-react';
import AddTask from './AddTask';
import EditTask from './EditTask';

const TasksList = ({ asModal = false, isOpen, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    if (!asModal || isOpen) {
      fetchData();
    }
  }, [isOpen, asModal]);

  const fetchData = async () => {
    try {
      const [tasksData, subjectsData] = await Promise.all([
        academicAPI.getTasks(),
        academicAPI.getSubjects()
      ]);
      setTasks(tasksData.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
      setSubjects(subjectsData);
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
      addToast(`Tarea marcada como ${newStatus === 'completed' ? 'completada' : 'pendiente'}`, 'success');
      fetchData(); // reload
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (asModal && !isOpen) return null;

  const content = (
    <div className="dashboard fade-in" style={asModal ? { padding: '2rem', height: '100%', overflowY: 'auto' } : {}}>
      {asModal && (
        <button className="icon-btn" onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <X size={20} />
        </button>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckSquare size={28} color="hsl(var(--primary))" /> Gestión de Tareas
          </h1>
          <p className="text-muted">Administra todo tu flujo de trabajo, crea o edita deberes específicos.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddTask(true)}>
          <PlusSquare size={18} /> Nueva Tarea
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="spinner" size={32} />
        </div>
      ) : (
        <div className="glass-panel p-4">
          {tasks.length === 0 ? (
            <p className="text-center text-muted py-4">No tienes tareas registradas en este momento.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.map(task => {
                const subj = subjects.find(s => s.id === task.subjectId);
                const isCompleted = task.status === 'completed';
                const dateNum = new Date(task.dueDate).getDate().toString().padStart(2, '0');
                const monthNum = (new Date(task.dueDate).getMonth() + 1).toString().padStart(2, '0');
                const timeString = new Date(task.dueDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={task.id} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    background: 'hsl(var(--bg-base))', padding: '1rem', borderRadius: 'var(--radius-md)',
                    opacity: isCompleted ? 0.6 : 1, transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input 
                        type="checkbox" 
                        checked={isCompleted} 
                        onChange={() => toggleTaskStatus(task)}
                        style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', accentColor: 'hsl(var(--primary))' }}
                      />
                      <div>
                        <p style={{ margin: 0, fontWeight: '600', fontSize: '1.05rem', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                          {task.title}
                        </p>
                        <small className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          {subj?.name} | <Calendar size={12}/> {`${dateNum}/${monthNum} - ${timeString}`}
                        </small>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setSelectedTaskId(task.id); setShowEditTask(true); }} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }} title="Editar Tarea">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <AddTask 
        isOpen={showAddTask} 
        onClose={() => setShowAddTask(false)} 
        onSuccess={fetchData} 
      />
      <EditTask 
        isOpen={showEditTask} 
        onClose={() => setShowEditTask(false)} 
        onSuccess={fetchData} 
        taskId={selectedTaskId} 
      />
    </div>
  );

  if (asModal) {
    return createPortal(
      <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 9999 }}>
        <div className="modal glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '100%', height: '80vh', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {content}
        </div>
      </div>,
      document.body
    );
  }

  return content;
};

export default TasksList;
