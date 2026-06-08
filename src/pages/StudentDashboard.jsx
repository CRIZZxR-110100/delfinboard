import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { academicAPI, userAPI } from '../services/api';
import { Book, Plus, GraduationCap, MessageCircle, CheckSquare, PlusCircle, Calculator, Calendar, Edit2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import './Dashboard.css';
import AddSubject from './AddSubject';
import AddTask from './AddTask';
import AddPartialGrade from './AddPartialGrade';
import SubjectView from './SubjectView';
import EditTask from './EditTask';
import TasksList from './TasksList';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ approvedCount: 0, failedCount: 0, cursandoCount: 0 });
  const [loading, setLoading] = useState(true);

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddGrade, setShowAddGrade] = useState(false);
  
  const [showSubjectView, setShowSubjectView] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [showEditTask, setShowEditTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showAllTasksModal, setShowAllTasksModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, tasksRes, messagesData] = await Promise.all([
        academicAPI.getSubjects(),
        academicAPI.getTasks(),
        userAPI.getMyMessages()
      ]);
      setSubjects(subjectsRes);
      setTasks(tasksRes);
      setMessages(messagesData);

      let approved = 0;
      let failed = 0;
      subjectsRes.forEach(sub => {
        const isFinished = sub.partials && sub.partials.filter(p => p.grade !== null).length >= sub.totalPartials;
        if (sub.finalGrade >= 70) {
          approved++;
        } else if (isFinished && sub.finalGrade < 70) {
          failed++;
        }
      });
      setStats({
        approvedCount: approved,
        failedCount: failed,
        cursandoCount: subjectsRes.length
      });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    try {
      await academicAPI.updateTaskStatus(taskId, 'completed');
      addToast('Tarea completada exitosamente', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const enCursoMath = Math.max(0, stats.cursandoCount - stats.approvedCount - stats.failedCount);

  const chartData = [
    { name: 'Aprobadas', value: stats.approvedCount, color: 'hsl(var(--success))' },
    { name: 'Reprobadas', value: stats.failedCount, color: 'hsl(var(--error))' },
    ...(enCursoMath > 0 ? [{ name: 'En Curso', value: enCursoMath, color: 'hsl(var(--primary))' }] : [])
  ];

  const pendingTasks = tasks.filter(t => t.status === 'pending');

  return (
    <div className="dashboard fade-in">
      <header className="dashboard-header">
        <h1>Hola, {user?.name.split(' ')[0]}</h1>
        <p className="text-muted">Gestiona tu carga académica de este semestre ({stats.cursandoCount} materias registradas).</p>
      </header>

      {/* Acciones Rápidas (Gestión Académica) Moviendo arriba de las gráficas */}
      <div className="glass-panel p-4 mt-4" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <h2 className="section-title w-full text-center" style={{ width: '100%' }}><Plus size={20} /> Gestión Académica Rápida</h2>
        <button onClick={() => setShowAddSubject(true)} className="btn-primary" style={{ flex: '1 1 200px' }}>
          <PlusCircle size={18} /> Registrar Materia
        </button>
        <button onClick={() => setShowAddTask(true)} className="btn-secondary" style={{ flex: '1 1 200px' }}>
          <CheckSquare size={18} /> Añadir Tarea
        </button>
        <button onClick={() => setShowAddGrade(true)} className="btn-secondary" style={{ flex: '1 1 200px' }}>
          <Calculator size={18} /> Ingresar Calificación
        </button>
      </div>

      <div className="student-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="glass-panel p-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="section-title w-full"><GraduationCap size={20} /> Desempeño del Semestre</h2>

          {stats.cursandoCount === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
              <p className="text-muted text-center" style={{ margin: 0 }}>No hay materias registradas</p>
            </div>
          ) : (
            <>
              <div style={{ position: 'relative', width: '100%', height: 160, display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={80}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text for Half Donut */}
                <div style={{ position: 'absolute', bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '2.5rem', lineHeight: '1', margin: 0, fontWeight: 700 }}>{stats.cursandoCount}</h3>
                  <small className="text-muted" style={{ display: 'block', transform: 'translateY(-4px)' }}>Materias inscritas</small>
                </div>
              </div>

              <div style={{ width: '100%', marginTop: '1.5rem', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {chartData.map(item => (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid hsla(0,0%,50%,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 14, height: 14, borderRadius: '4px', background: item.color }}></div>
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                    </div>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="glass-panel p-4" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="section-title"><CheckSquare size={20} /> Tareas Pendientes</h2>
          {(() => {
            if (pendingTasks.length === 0) {
              return (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                  <p className="text-muted text-center" style={{ margin: 0 }}>¡Al día! No tienes tareas pendientes.</p>
                </div>
              );
            }

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const processedTasks = pendingTasks.map(t => {
              const dueDateObj = new Date(t.dueDate);
              const dateOnly = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate());
              const diffDays = Math.floor((dateOnly - today) / (1000 * 60 * 60 * 24));
              return { ...t, dueDateObj, diffDays };
            }).sort((a, b) => a.dueDateObj - b.dueDateObj); // Sort chronologically

            const week1Tasks = processedTasks.filter(t => t.diffDays >= 0 && t.diffDays <= 7);
            const week2Tasks = processedTasks.filter(t => t.diffDays > 7 && t.diffDays <= 14);
            const futureTasks = processedTasks.filter(t => t.diffDays > 14);

            // Hide everything else? The user says "muestre solo las tareas de 2 semanas"
            if (week1Tasks.length === 0 && week2Tasks.length === 0) {
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '1rem' }}>
                  <p className="text-muted text-center" style={{ margin: 0 }}>No hay tareas próximas (en las siguientes 2 semanas).</p>
                  {futureTasks.length > 0 && (
                    <button onClick={() => setShowAllTasksModal(true)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                      Ver {futureTasks.length} {futureTasks.length === 1 ? 'tarea posterior' : 'tareas posteriores'}
                    </button>
                  )}
                </div>
              );
            }

            // Group week 1
            const groupedWeek1 = [];
            week1Tasks.forEach(t => {
              let dayLabel = '';
              
              if (t.diffDays === 0) dayLabel = 'Hoy';
              else if (t.diffDays === 1) dayLabel = 'Mañana';
              else {
                let weekdayStr = t.dueDateObj.toLocaleDateString('es-ES', { weekday: 'long' });
                let dateStr = t.dueDateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
                dayLabel = `${weekdayStr.charAt(0).toUpperCase() + weekdayStr.slice(1)} (${dateStr})`;
              }
              
              let group = groupedWeek1.find(g => g.label === dayLabel);
              if (!group) {
                group = { label: dayLabel, tasks: [] };
                groupedWeek1.push(group);
              }
              group.tasks.push(t);
            });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                {groupedWeek1.map(group => (
                  <div key={group.label} style={{ marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'hsl(var(--text-muted))', borderBottom: '1px solid hsla(0,0%,50%,0.2)', paddingBottom: '0.25rem' }}>{group.label}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {group.tasks.map(task => {
                        const subj = subjects.find(s => s.id === task.subjectId);
                        const timeString = task.dueDateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                        return (
                          <div key={task.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: 'hsl(var(--bg-base))', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{task.title}</p>
                              <small className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                {subj?.name} | <Calendar size={12} /> {timeString}
                              </small>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={(e) => { e.stopPropagation(); setSelectedTaskId(task.id); setShowEditTask(true); }} className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }} title="Editar">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => completeTask(task.id)} className="btn-primary" style={{ padding: '0.4rem', borderRadius: '50%' }} title="Marcar completada">
                                <CheckSquare size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {week2Tasks.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'hsl(var(--text-muted))', borderBottom: '1px solid hsla(0,0%,50%,0.2)', paddingBottom: '0.25rem' }}>Próxima Semana</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {week2Tasks.map(task => {
                        const subj = subjects.find(s => s.id === task.subjectId);
                        const dateString = task.dueDateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                        return (
                          <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsl(var(--bg-base))', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{task.title}</p>
                              <small className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                {subj?.name} | <Calendar size={12} /> {dateString}
                              </small>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={(e) => { e.stopPropagation(); setSelectedTaskId(task.id); setShowEditTask(true); }} className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }} title="Editar">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => completeTask(task.id)} className="btn-primary" style={{ padding: '0.4rem', borderRadius: '50%' }} title="Marcar completada">
                                <CheckSquare size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {futureTasks.length > 0 && (
                  <div style={{ textAlign: 'center', marginTop: '0.5rem', paddingBottom: '0.5rem' }}>
                    <button onClick={() => setShowAllTasksModal(true)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', width: '100%' }}>
                      Ver {futureTasks.length} {futureTasks.length === 1 ? 'tarea posterior' : 'tareas posteriores'}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

      </div>

      <div className="glass-panel p-4 mt-4" style={{ marginTop: '2rem' }}>
        <h2 className="section-title"><Book size={20} /> Historial del Semestre</h2>
        <div className="table-container">
          {loading ? <p>Cargando...</p> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>Secuencias Capturadas</th>
                  <th>Calificación Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length === 0 ? (
                  <tr><td colSpan="4" className="text-center text-muted">No hay materias registradas</td></tr>
                ) : subjects.map(s => {
                  const isFinished = s.partials && s.partials.filter(p => p.grade !== null).length >= s.totalPartials;
                  const isApproved = s.finalGrade >= 70;
                  return (
                    <tr 
                      key={s.id}
                      onClick={() => { setSelectedSubjectId(s.id); setShowSubjectView(true); }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: '600' }}>
                        {s.name}
                      </td>
                      <td>
                        <span className="text-muted" style={{ fontWeight: 500 }}>
                          {s.totalPartials} secuencias
                        </span>
                      </td>
                      <td><strong>{s.finalGrade} / 100</strong></td>
                      <td>
                        {!isFinished && s.finalGrade < 70 ? (
                          <span className="badge" style={{ background: 'hsl(var(--primary))', color: '#fff', display: 'inline-block', textAlign: 'left' }}>EN CURSO</span>
                        ) : (
                          <span className={`badge ${isApproved ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-block', textAlign: 'left' }}>
                            {isApproved ? 'APROBADA' : 'REPROBADA'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="glass-panel p-4 mt-4" style={{ marginTop: '2rem' }}>
        <h2 className="section-title"><MessageCircle size={20} /> Bandeja de Mensajes del Tutor</h2>
        {messages.length === 0 ? (
          <p className="text-muted text-center p-4">Tu tutor no ha mandado mensajes nuevos</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map(m => (
              <div key={m.id} style={{ padding: '1rem', background: 'hsl(var(--bg-base))', borderRadius: 'var(--radius-md)', borderLeft: '4px solid hsl(var(--primary))' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: 'hsl(var(--primary))' }}>Tutor Académico</p>
                <p style={{ margin: 0, color: 'hsl(var(--text-main))', lineHeight: 1.5 }}>{m.content}</p>
                <small style={{ display: 'block', marginTop: '0.75rem', color: 'hsl(var(--text-muted))', opacity: 0.8 }}>
                  Recibido el: {new Date(m.date).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
      <AddSubject 
        isOpen={showAddSubject} 
        onClose={() => setShowAddSubject(false)} 
        onSuccess={fetchData} 
      />
      <AddTask 
        isOpen={showAddTask} 
        onClose={() => setShowAddTask(false)} 
        onSuccess={fetchData} 
      />
      <AddPartialGrade 
        isOpen={showAddGrade} 
        onClose={() => setShowAddGrade(false)} 
        onSuccess={fetchData} 
      />
      <SubjectView 
        isOpen={showSubjectView} 
        onClose={() => setShowSubjectView(false)} 
        subjectId={selectedSubjectId} 
      />
      <EditTask 
        isOpen={showEditTask} 
        onClose={() => setShowEditTask(false)} 
        onSuccess={fetchData} 
        taskId={selectedTaskId} 
      />
      <TasksList 
        asModal={true} 
        isOpen={showAllTasksModal} 
        onClose={() => { setShowAllTasksModal(false); fetchData(); }} 
      />
    </div>
  );
};

export default StudentDashboard;
