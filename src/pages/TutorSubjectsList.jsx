import React, { useState, useEffect } from 'react';
import { tutorAPI, academicAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { BookOpen, AlertTriangle, Loader2 } from 'lucide-react';

const TutorSubjectsList = () => {
  const [subjectsInfo, setSubjectsInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const stats = await tutorAPI.getDashboardStats();
      const mapped = stats.allSubjects || [];
      setSubjectsInfo(mapped);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen size={28} color="hsl(var(--primary))" /> Materias cursadas por tus tutorados
        </h1>
        <p className="text-muted">Desglose de las materias que tus tutorados están cursando y el respectivo índice de salud de retención.</p>
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
                  <th>Materia</th>
                  <th>Número de Inscritos</th>
                  <th>Nivel de Dificultad %</th>
                  <th>Estatus</th>
                </tr>
              </thead>
              <tbody>
                {subjectsInfo.map((s, idx) => (
                  <tr key={s.id || idx}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.totalStudents} {s.totalStudents === 1 ? 'tutorado inscrito' : 'tutorados inscritos'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, backgroundColor: 'hsla(0,0%,50%,0.2)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${s.failRate}%`,
                            backgroundColor: s.failRate > 40 ? 'hsl(var(--error))' : (s.failRate > 20 ? 'hsl(30, 100%, 50%)' : 'hsl(var(--success))')
                          }}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.failRate}%</span>
                      </div>
                    </td>
                    <td>
                      {s.failRate > 50 ? (
                        <span className="badge badge-risk-alto" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} /> Riesgo Alto
                        </span>
                      ) : s.failRate > 20 ? (
                        <span className="badge badge-risk-medio" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} /> Riesgo Medio
                        </span>
                      ) : (
                        <span className="badge badge-risk-bajo" style={{ display: 'inline-block' }}>Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorSubjectsList;
