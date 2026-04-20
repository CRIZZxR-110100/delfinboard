import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { tutorAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, AlertTriangle, BookOpen, Send, AlertOctagon, X, User } from 'lucide-react';
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

  return (
    <div className="dashboard fade-in">
      <header className="dashboard-header">
        <h1>DefinBoard Tutor</h1>
        <p className="text-muted">Análisis global y seguimiento académico de tutorados del semestre.</p>
      </header>

      <div className="stats-grid">
        <div 
          className="stat-card glass-panel" 
          style={{ cursor: 'pointer', transition: 'all 0.2s' }} 
          onClick={() => navigate('/tutor/alumnos')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats?.totalStudents || 0}</h3>
            <p>Alumnos Tutorados</p>
          </div>
        </div>

        <div 
          className="stat-card glass-panel" 
          style={{ cursor: 'pointer', transition: 'all 0.2s' }} 
          onClick={() => setActiveStatModal('risk')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'hsla(var(--error), 0.1)', color: 'hsl(var(--error))' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats?.studentsAtRisk || 0}</h3>
            <p>Alumnos en Riesgo</p>
          </div>
        </div>

        <div 
          className="stat-card glass-panel" 
          style={{ cursor: 'pointer', transition: 'all 0.2s' }} 
          onClick={() => navigate('/tutor/materias')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'hsla(var(--secondary), 0.1)', color: 'hsl(var(--secondary))' }}>
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats?.globalFailRate || 0}%</h3>
            <p>Porcentaje General de Reprobados</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Dona de Panorama de Riesgos */}
        <div className="glass-panel p-4">
          <h2 className="section-title">Alineación de Grupo: Salud Analizada</h2>
          <div style={{ height: 300, width: '100%' }}>
            {riskData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={riskData}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Alumno(s)`, 'Tutorados']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p className="text-muted">Procesando datos...</p></div>
            )}
          </div>
        </div>

        {/* Panel de Enfoque de Tareas */}
        <div className="glass-panel p-4">
          <h2 className="section-title">
             Esfuerzo del Grupo: Cumplimiento de Tareas
          </h2>
          <div style={{ height: 300, width: '100%' }}>
            {hasTasks ? (
              <ResponsiveContainer>
                <BarChart data={taskDistribution}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} Tareas`, 'Frecuencia']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                     {taskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                 <p className="text-muted" style={{ margin: 0 }}>Aún no hay tareas asignadas o registradas</p>
                 <small style={{ color: 'hsl(var(--text-muted))', opacity: 0.7, marginTop: '5px' }}>por los alumnos de este grupo.</small>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="tutor-grid">
        <div className="glass-panel p-4" style={{ maxWidth: '100%', overflow: 'hidden' }}>
          <h2 className="section-title">Resumen de Tutorados</h2>
          <div className="table-container" style={{ width: '100%', overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: '700px' }}>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Promedio</th>
                  <th>Materias Activas</th>
                  <th>Nivel Riesgo</th>
                  <th>Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} style={s.hasCriticalAlert ? { backgroundColor: 'hsla(0, 84%, 60%, 0.05)' } : {}}>
                    <td>
                      {s.name}
                      {s.hasCriticalAlert && <AlertOctagon size={14} style={{ color: 'hsl(var(--error))', marginLeft: '0.5rem', display: 'inline' }} title="Alerta Crítica: Reprobación Constante" />}
                    </td>
                    <td>{s.average > 0 ? s.average : 'N/A'}</td>
                    <td>{s.activeSubjects} mat.</td>
                    <td>
                      <span className={`badge badge-risk-${s.academicStatus === 'Riesgo Alto' ? 'alto' : s.academicStatus === 'En Curso' ? 'medio' : 'bajo'}`}>
                        {s.academicStatus}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => setSelectedStudent(s)} className="btn-icon">
                        <Send size={16} /> Mensaje
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* --- Modal Enviar Mensaje --- */}
      {selectedStudent && createPortal(
        <div className="modal-overlay fade-in">
          <div className="modal glass-panel">
            <h3>Contactar a {selectedStudent.name}</h3>
            <p className="text-muted text-sm mb-4">El alumno recibirá este mensaje como una alerta en su buzón de entrada. {selectedStudent.hasCriticalAlert && <strong style={{ color: 'hsl(var(--error))' }}><br/>Este alumno está a punto de ser dado de baja.</strong>}</p>
            <form onSubmit={handleSendMessage}>
              <textarea 
                className="input-field" 
                rows="4" 
                placeholder="Escribe tu mensaje oficial aquí..."
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
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
