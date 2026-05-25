import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { tutorAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Users, AlertTriangle, BookOpen, Send, AlertOctagon, X, User, TrendingUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const TutorDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // States para interacción
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [msgContent, setMsgContent] = useState('');
  const [activeStatModal, setActiveStatModal] = useState(null); // 'risk'
  const [activeChartModal, setActiveChartModal] = useState(false);
  const [chartModalData, setChartModalData] = useState({ title: '', students: [], type: '', dataKey: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, studentsData] = await Promise.all([
        tutorAPI.getDashboardStats(),
        tutorAPI.getStudentsList()
      ]);
      setStats(statsData);
      setStudents(studentsData);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgContent) return;
    try {
      await tutorAPI.sendMessage({ studentId: selectedStudent.id, content: msgContent });
      addToast('Mensaje enviado al alumno', 'success');
      setMsgContent('');
      setSelectedStudent(null);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleChartClick = (type, data) => {
    if (!data) return;
    const dataKey = data.name || data;
    let filteredStudents = [];
    let title = '';

    if (type === 'grades') {
      title = `Alumnos con Promedio: ${dataKey}`;
      filteredStudents = students.filter(s => {
        const score = parseFloat(s.average) || 0;
        if (dataKey.includes('Excelente')) return score >= 90;
        if (dataKey.includes('Bueno')) return score >= 80 && score < 90;
        if (dataKey.includes('Regular')) return score >= 70 && score < 80;
        if (dataKey.includes('Deficiente')) return score < 70;
        return false;
      });
    } else if (type === 'tasks') {
      title = `Alumnos con Tareas: ${dataKey}`;
      filteredStudents = students.filter(s => {
        if (!s.taskStats) return false;
        if (dataKey === 'Entregadas') return s.taskStats.completed > 0;
        if (dataKey === 'En Tiempo') return s.taskStats.pending > 0;
        if (dataKey === 'Vencidas') return s.taskStats.overdue > 0;
        return false;
      });
    } else if (type === 'risk') {
      title = `Alumnos en Estado: ${dataKey}`;
      filteredStudents = students.filter(s => s.academicStatus === dataKey);
    } else if (type === 'failVolume') {
      title = `Alumnos con ${dataKey}`;
      filteredStudents = students.filter(s => {
        if (dataKey === '0 Reprobadas') return s.failedSubjects === 0;
        if (dataKey === '1 Reprobada') return s.failedSubjects === 1;
        if (dataKey === '2 Reprobadas') return s.failedSubjects === 2;
        if (dataKey === '3+ Reprobadas') return s.failedSubjects >= 3;
        return false;
      });
    }

    setChartModalData({ title, students: filteredStudents, type, dataKey });
    setActiveChartModal(true);
  };

  if (loading) return <div className="p-4 text-center">Cargando métricas...</div>;

  // Calculos Analíticos Locales de Frontend
  const statusCounts = { 'Normal': 0, 'En Curso': 0, 'Riesgo Alto': 0 };
  students.forEach(s => {
    if (statusCounts[s.academicStatus] !== undefined) statusCounts[s.academicStatus]++;
  });

  const riskData = [
    { name: 'Riesgo Alto', value: statusCounts['Riesgo Alto'], color: 'hsl(0, 84%, 60%)' },
    { name: 'En Curso', value: statusCounts['En Curso'], color: 'hsl(45, 100%, 50%)' },
    { name: 'Normal', value: statusCounts['Normal'], color: 'hsl(142, 71%, 45%)' }
  ].filter(d => d.value > 0);

  const taskDistribution = stats?.taskDistribution || [];
  const hasTasks = taskDistribution.some(t => t.value > 0);
  const hasGrades = stats?.gradeDistribution?.some(g => g.value > 0);
  const hasFailed = stats?.failedSubjectsDistribution?.some(f => f.value > 0);
  const hasPerformance = stats?.performanceEvolution?.length > 0;

  const EmptyState = ({ text }) => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
      <BookOpen size={32} style={{ color: 'hsla(var(--text-muted), 0.3)', marginBottom: '0.75rem' }} />
      <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{text}</p>
    </div>
  );

  return (
    <div className="tutor-viewport-container fade-in">
      <header className="tutor-viewport-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>DelfinBoard Tutor</h1>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Análisis global y seguimiento académico de tutorados del semestre.</p>
          </div>
        </div>
      </header>

      <div className="tutor-viewport-stats">
        <div 
          className="stat-card glass-panel" 
          style={{ cursor: 'pointer', transition: 'all 0.2s', padding: '1rem' }} 
          onClick={() => navigate('/tutor/alumnos')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', width: 40, height: 40 }}>
            <Users size={20} />
          </div>
          <div className="stat-info">
            <h3 style={{ fontSize: '1.25rem' }}>{stats?.totalStudents || 0}</h3>
            <p style={{ fontSize: '0.8rem' }}>Alumnos Tutorados</p>
          </div>
        </div>

        <div 
          className="stat-card glass-panel" 
          style={{ cursor: 'pointer', transition: 'all 0.2s', padding: '1rem' }} 
          onClick={() => setActiveStatModal('risk')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'hsla(var(--error), 0.1)', color: 'hsl(var(--error))', width: 40, height: 40 }}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-info">
            <h3 style={{ fontSize: '1.25rem' }}>{stats?.studentsAtRisk || 0}</h3>
            <p style={{ fontSize: '0.8rem' }}>Alumnos en Riesgo</p>
          </div>
        </div>

        <div 
          className="stat-card glass-panel" 
          style={{ cursor: 'pointer', transition: 'all 0.2s', padding: '1rem' }} 
          onClick={() => navigate('/tutor/materias')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'hsla(var(--secondary), 0.1)', color: 'hsl(var(--secondary))', width: 40, height: 40 }}>
            <CheckCircle size={20} />
          </div>
          <div className="stat-info">
            <h3 style={{ fontSize: '1.25rem' }}>{stats?.complianceRate || 0}%</h3>
            <p style={{ fontSize: '0.8rem' }}>Tasa de Cumplimiento</p>
          </div>
        </div>
      </div>

      <div className="tutor-viewport-grid">
        {/* Tarjeta 1: Tabla de Alumnos */}
        <div className="tutor-viewport-card glass-panel">
          <h2 className="section-title">Resumen de Tutorados</h2>
          <div className="tutor-viewport-table-container">
            <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Prom.</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'hsl(var(--text-muted))' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={28} style={{ opacity: 0.5 }} />
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Aún no tienes alumnos inscritos.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map(s => (
                    <tr key={s.id} style={s.hasCriticalAlert ? { backgroundColor: 'hsla(0, 84%, 60%, 0.05)' } : {}}>
                      <td style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.name}>
                        {s.name}
                        {s.hasCriticalAlert && <AlertOctagon size={12} style={{ color: 'hsl(var(--error))', marginLeft: '0.25rem', display: 'inline' }} />}
                      </td>
                      <td>{s.average > 0 ? s.average : '-'}</td>
                      <td>
                        <span className={`badge badge-risk-${s.academicStatus === 'Riesgo Alto' ? 'alto' : s.academicStatus === 'En Curso' ? 'medio' : 'bajo'}`} style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>
                          {s.academicStatus}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => setSelectedStudent(s)} className="btn-icon" style={{ padding: '0.25rem' }}>
                          <Send size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tarjeta 2: Distribución de Promedios (Movido hacia arriba) */}
        <div className="tutor-viewport-card glass-panel">
          <h2 className="section-title">Distribución Promedios</h2>
          <div className="tutor-viewport-content">
            {hasGrades ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.gradeDistribution || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value} Alumno(s)`, 'Frecuencia']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {stats?.gradeDistribution?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="interactive-chart-element" 
                        onClick={() => handleChartClick('grades', entry)} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="Aquí verás una campana de distribución mostrando cuántos alumnos tienen promedios excelentes, buenos, regulares o deficientes." />
            )}
          </div>
        </div>

        {/* Tarjeta 3: Gráfica de Salud */}
        <div className="tutor-viewport-card glass-panel">
          <h2 className="section-title">Alineación de Grupo</h2>
          <div className="tutor-viewport-content">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskData} innerRadius="50%" outerRadius="80%" paddingAngle={5} dataKey="value">
                    {riskData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="interactive-chart-element" 
                        onClick={() => handleChartClick('risk', entry)} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Alumno(s)`, 'Tutorados']} />
                  <Legend verticalAlign="bottom" height={24} iconSize={10} wrapperStyle={{ fontSize: '0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="Muestra la proporción de alumnos que están estables frente a los que se encuentran en riesgo alto de reprobación." />
            )}
          </div>
        </div>

        {/* Tarjeta 4: Evolución de Rendimiento */}
        <div className="tutor-viewport-card glass-panel">
          <h2 className="section-title">Evolución de Rendimiento</h2>
          <div className="tutor-viewport-content">
            {hasPerformance ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.performanceEvolution || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--text), 0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="promedio" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="Aquí se dibujará una línea de tendencia mostrando si el grupo mejora o empeora su promedio conforme avanzan los parciales." />
            )}
          </div>
        </div>

        {/* Tarjeta 5: Volumen de Reprobación */}
        <div className="tutor-viewport-card glass-panel">
          <h2 className="section-title">Gravedad de Rezago</h2>
          <div className="tutor-viewport-content">
            {hasFailed ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.failedSubjectsDistribution || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value} Alumno(s)`, 'Cantidad']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {stats?.failedSubjectsDistribution?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="interactive-chart-element" 
                        onClick={() => handleChartClick('failVolume', entry)} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="Indica cuántos alumnos tienen 0, 1, 2 o más materias reprobadas actualmente." />
            )}
          </div>
        </div>

        {/* Tarjeta 6: Cumplimiento de Tareas (movido al final) */}
        <div className="tutor-viewport-card glass-panel">
          <h2 className="section-title">Cumplimiento de Tareas</h2>
          <div className="tutor-viewport-content">
            {hasTasks ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value} Tareas`, 'Frecuencia']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                     {taskDistribution.map((entry, index) => (
                       <Cell 
                         key={`cell-${index}`} 
                         fill={entry.color} 
                         className="interactive-chart-element" 
                         onClick={() => handleChartClick('tasks', entry)} 
                       />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="Resumen del volumen de tareas entregadas, pendientes y vencidas de todo tu grupo." />
            )}
          </div>
        </div>
      </div>

      {/* --- Ovelays (Modales) de Métricas Principales --- */}
      {activeStatModal === 'risk' && createPortal(
        <div className="modal-overlay fade-in" onClick={() => setActiveStatModal(null)}>
          <div className="modal glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--error))' }}><AlertTriangle size={20}/> Alumnos en Riesgo</h3>
              <button className="icon-btn" onClick={() => setActiveStatModal(null)}><X size={20} /></button>
            </div>
            <p className="text-muted">Listado de tutorados con tendencia actual al fracaso o promedios estancados:</p>
            
            <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              <ul style={{ paddingLeft: '0', listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {students.filter(s => s.academicStatus !== 'Normal').map(s => (
                  <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsla(0,0%,50%,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <User size={16} style={{ color: 'hsl(var(--text-muted))' }} />
                      <strong>{s.name}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem' }}>Promedio: <strong>{s.average > 0 ? s.average : 'N/A'}</strong></span>
                      <span className={`badge badge-risk-${s.academicStatus === 'Riesgo Alto' ? 'alto' : s.academicStatus === 'En Curso' ? 'medio' : 'bajo'}`}>{s.academicStatus}</span>
                    </div>
                  </li>
                ))}
                {students.filter(s => s.academicStatus === 'Riesgo Alto' || s.academicStatus === 'En Curso').length === 0 && (
                  <li style={{ padding: '1rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>El grupo se encuentra completamente estable.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      , document.body)}

      {/* --- Modal Dinámico de Gráficas --- */}
      {activeChartModal && createPortal(
        <div className="modal-overlay fade-in" onClick={() => setActiveChartModal(false)}>
          <div className="modal glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--text))' }}>{chartModalData.title}</h3>
              <button className="icon-btn" onClick={() => setActiveChartModal(false)}><X size={20} /></button>
            </div>
            
            <p className="text-muted text-sm mb-4">Total de alumnos en esta categoría: <strong>{chartModalData.students.length}</strong></p>

            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {chartModalData.students.length === 0 ? (
                <p className="text-muted text-center p-4">No hay alumnos en esta categoría.</p>
              ) : (
                <ul style={{ paddingLeft: '0', listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {chartModalData.students.map(s => (
                    <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsla(0,0%,50%,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={16} style={{ color: 'hsl(var(--text-muted))' }} />
                        <strong>{s.name}</strong>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {chartModalData.type === 'tasks' && s.taskStats && (
                          <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                            {chartModalData.dataKey === 'Vencidas' ? `Debe: ${s.taskStats.overdue}` : chartModalData.dataKey === 'Entregadas' ? `Entregó: ${s.taskStats.completed}` : `Pendientes: ${s.taskStats.pending}`}
                          </span>
                        )}

                        {chartModalData.type === 'failVolume' && (
                          <span style={{ fontSize: '0.85rem', color: s.failedSubjects > 0 ? 'hsl(var(--error))' : 'inherit' }}>
                            Reprobadas: <strong>{s.failedSubjects}</strong>
                          </span>
                        )}

                        {(chartModalData.type === 'grades' || chartModalData.type === 'risk') && (
                          <span style={{ fontSize: '0.85rem' }}>Promedio global: <strong>{s.average > 0 ? s.average : 'N/A'}</strong></span>
                        )}

                        <button onClick={() => { setActiveChartModal(false); setSelectedStudent(s); }} className="btn-icon" style={{ padding: '0.25rem' }} title="Enviar Mensaje">
                          <Send size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setActiveChartModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* --- Modal Enviar Mensaje --- */}
      {selectedStudent && createPortal(
        <div className="modal-overlay fade-in">
          <div className="modal glass-panel">
            <h3>Contactar a {selectedStudent.name}</h3>
            <p className="text-muted text-sm mb-4">El alumno recibirá este mensaje como una alerta en su buzón de entrada. {selectedStudent.hasCriticalAlert && <strong style={{ color: 'hsl(var(--error))' }}><br/>Este alumno está a punto de ser dado de baja.</strong>}</p>
            <form onSubmit={handleSendMessage}>
              <textarea 
                className="input-field" 
                placeholder="Escribe tu mensaje oficial aquí..."
                value={msgContent}
                onChange={(e) => {
                  setMsgContent(e.target.value);
                  // Ajuste dinámico de altura (auto-resize)
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                style={{ resize: 'none', minHeight: '100px', overflow: 'hidden' }}
              />
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelectedStudent(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">Enviar</button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}

    </div>
  );
};

export default TutorDashboard;
