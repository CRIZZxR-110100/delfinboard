import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { tutorAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Users, AlertOctagon, Send, Search, Loader2 } from 'lucide-react';

const TutorStudentsList = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [msgContent, setMsgContent] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await tutorAPI.getStudentsList();
      setStudents(data);
      setFiltered(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFiltered(students.filter(s => s.name.toLowerCase().includes(term) || s.academicStatus.toLowerCase().includes(term)));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgContent) return;
    try {
      await tutorAPI.sendMessage({ studentId: selectedStudent.id, content: msgContent });
      addToast('Mensaje enviado exitosamente', 'success');
      setMsgContent('');
      setSelectedStudent(null);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="dashboard fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={28} color="hsl(var(--primary))" /> Directorio de Tutorados
          </h1>
          <p className="text-muted">Gestión de tu clase activa y monitoreo preventivo de alumnos asignados en tu portafolio semestral.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'hsl(var(--text-muted))' }}/>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar alumno o riesgo..." 
            value={searchTerm}
            onChange={handleSearch}
            style={{ paddingLeft: '2.5rem', width: '250px' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="spinner" size={32} />
        </div>
      ) : (
        <div className="glass-panel p-4">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre del Estudiante</th>
                  <th>Promedio Actual</th>
                  <th>Materias Activas</th>
                  <th>Riesgo Institucional</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">No se encontraron tutorados.</td>
                  </tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s.id} style={s.hasCriticalAlert ? { backgroundColor: 'hsla(0, 84%, 60%, 0.05)' } : {}}>
                      <td style={{ fontWeight: 600 }}>
                        {s.name}
                        {s.hasCriticalAlert && <AlertOctagon size={14} style={{ color: 'hsl(var(--error))', marginLeft: '0.5rem', display: 'inline' }} title="Alerta Crítica: Reprobación Constante" />}
                      </td>
                      <td><strong>{s.average > 0 ? s.average : 'N/A'}</strong></td>
                      <td>{s.activeSubjects} materias cursando</td>
                      <td>
                        <span className={`badge badge-risk-${s.academicStatus === 'Riesgo Alto' ? 'alto' : s.academicStatus === 'En Curso' ? 'medio' : 'bajo'}`} style={{ display: 'inline-block' }}>
                          {s.academicStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => setSelectedStudent(s)} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Send size={14} /> Contactar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedStudent && createPortal(
        <div className="modal-overlay fade-in">
          <div className="modal glass-panel">
            <h3>Contactar a {selectedStudent.name}</h3>
            <p className="text-muted text-sm mb-4">El alumno recibirá este mensaje como alerta en su bandeja de entrada.</p>
            <form onSubmit={handleSendMessage}>
              <textarea 
                className="input-field" 
                rows="4" 
                placeholder="Motivo del llamado (ej. Asesoría, Bajasificaciones...)"
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
              />
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelectedStudent(null)}>Cerrar</button>
                <button type="submit" className="btn-primary">Enviar Aviso</button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default TutorStudentsList;
