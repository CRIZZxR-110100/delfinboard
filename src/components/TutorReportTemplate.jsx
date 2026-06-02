import React, { forwardRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, Tooltip } from 'recharts';

const PAGE_WIDTH = 792; // Pixels width for Letter size roughly
const ROWS_PER_PAGE = 30; // Max rows per table chunk to avoid page overflow

const TutorReportTemplate = forwardRef(({ stats, students, tutorName }, ref) => {
  if (!stats || !students) return null;

  const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  // Filtrar alumnos para las tablas analíticas
  const atRiskStudents = students.filter(s => s.failedSubjects >= 3 || s.academicStatus === 'Riesgo Alto');
  const outstandingStudents = students.filter(s => s.average >= 90 && s.failedSubjects === 0);

  // Helper to chunk arrays for pagination
  const chunkArray = (arr, size) => {
    const chunked = [];
    for (let i = 0; i < arr.length; i += size) {
      chunked.push(arr.slice(i, i + size));
    }
    return chunked.length > 0 ? chunked : [[]];
  };

  const generalChunks = chunkArray(students, ROWS_PER_PAGE);
  const riskChunks = chunkArray(atRiskStudents, ROWS_PER_PAGE);
  const outChunks = chunkArray(outstandingStudents, ROWS_PER_PAGE);

  const Section = ({ children }) => (
    <div className="pdf-section" style={{ 
      width: `${PAGE_WIDTH}px`, 
      minHeight: '1056px', // Letter height roughly
      padding: '40px',
      backgroundColor: 'white',
      color: 'black',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {children}
    </div>
  );

  return (
    <div id="pdf-wrapper" ref={ref} style={{ position: 'absolute', top: 0, left: 0, zIndex: -9999, visibility: 'hidden', pointerEvents: 'none' }}>
      
      {/* SECCIÓN 1: Encabezado y Gráficas */}
      <Section>
        <div style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', margin: '0 0 10px 0', color: '#1a1a1a' }}>Reporte de Desempeño de Tutorados</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
            <span><strong>Tutor:</strong> {tutorName}</span>
            <span><strong>Fecha:</strong> {dateStr}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '24px' }}>{stats.totalStudents}</h3>
            <p style={{ margin: 0, fontSize: '12px' }}>Total Alumnos</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#e74c3c' }}>{stats.studentsAtRisk}</h3>
            <p style={{ margin: 0, fontSize: '12px' }}>En Riesgo Crítico</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#2ecc71' }}>{stats.complianceRate}%</h3>
            <p style={{ margin: 0, fontSize: '12px' }}>Tasa de Cumplimiento</p>
          </div>
        </div>

        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>Resumen Gráfico</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* Gráfica 1 */}
          <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', textAlign: 'center' }}>Distribución de Promedios</h4>
            <BarChart width={300} height={200} data={stats.gradeDistribution || []}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Bar dataKey="value">
                {stats.gradeDistribution?.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </div>

          {/* Gráfica 2 */}
          <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', textAlign: 'center' }}>Niveles de Riesgo</h4>
            <PieChart width={300} height={200}>
              <Pie data={stats.riskDistribution || []} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                {stats.riskDistribution?.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </div>

          {/* Gráfica 3 */}
          <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', textAlign: 'center' }}>Cumplimiento de Tareas</h4>
            <PieChart width={300} height={200}>
              <Pie data={stats.taskCompletion || []} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                {stats.taskCompletion?.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </div>

          {/* Gráfica 4 */}
          <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', textAlign: 'center' }}>Materias Reprobadas (Volumen)</h4>
            <LineChart width={300} height={200} data={stats.failedSubjectsStats || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--error))" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </div>

        </div>
      </Section>

      {/* SECCIÓN 2: Tablas Generales (Paginas Múltiples si es necesario) */}
      {generalChunks.map((chunk, i) => (
        <Section key={`gen-${i}`}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>
            Listado General de Alumnos {generalChunks.length > 1 ? `(Pág. ${i + 1}/${generalChunks.length})` : ''}
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Nombre del Alumno</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Promedio</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Materias Reprobadas</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Estado Académico</th>
              </tr>
            </thead>
            <tbody>
              {chunk.length === 0 ? <tr><td colSpan="4" style={{ textAlign:'center', padding:'20px' }}>Sin datos</td></tr> : null}
              {chunk.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '8px' }}>{s.name}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{s.average}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{s.failedSubjects}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{s.academicStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      ))}

      {/* SECCIÓN 3: Tabla de Riesgo Crítico */}
      {riskChunks.map((chunk, i) => (
        <Section key={`risk-${i}`}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#e74c3c' }}>
            Atención Requerida: Alumnos en Riesgo Crítico {riskChunks.length > 1 ? `(Pág. ${i + 1}/${riskChunks.length})` : ''}
          </h2>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>Alumnos con 3 o más materias reprobadas o estado de riesgo alto.</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#fdf3f2', borderBottom: '2px solid #e74c3c' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Nombre</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Promedio</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Reprobadas</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Tareas Pendientes</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Tareas Vencidas</th>
              </tr>
            </thead>
            <tbody>
              {chunk.length === 0 ? <tr><td colSpan="5" style={{ textAlign:'center', padding:'20px' }}>No hay alumnos en riesgo crítico.</td></tr> : null}
              {chunk.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '8px' }}>{s.name}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{s.average}</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#e74c3c', fontWeight: 'bold' }}>{s.failedSubjects}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{s.taskStats?.pending || 0}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{s.taskStats?.overdue || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      ))}

      {/* SECCIÓN 4: Tabla de Desempeño Sobresaliente */}
      {outChunks.map((chunk, i) => (
        <Section key={`out-${i}`}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#2ecc71' }}>
            Desempeño Sobresaliente {outChunks.length > 1 ? `(Pág. ${i + 1}/${outChunks.length})` : ''}
          </h2>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>Alumnos con promedio superior a 90 y sin materias reprobadas.</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2fcf5', borderBottom: '2px solid #2ecc71' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Nombre</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Promedio Final</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Tareas Entregadas</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Rendimiento</th>
              </tr>
            </thead>
            <tbody>
              {chunk.length === 0 ? <tr><td colSpan="4" style={{ textAlign:'center', padding:'20px' }}>No hay alumnos que cumplan este criterio aún.</td></tr> : null}
              {chunk.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '8px' }}>{s.name}</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#27ae60', fontWeight: 'bold' }}>{s.average}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{s.taskStats?.completed || 0}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>Excelente</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      ))}

      {/* SECCIÓN 5: Desglose de Materias por Alumno */}
      {chunkArray(students, 6).map((chunk, i, arr) => (
        <Section key={`desglose-${i}`}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>
            Desglose de Materias por Alumno {arr.length > 1 ? `(Pág. ${i + 1}/${arr.length})` : ''}
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Alumno / Materia</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Promedio / Calificación</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {chunk.length === 0 ? <tr><td colSpan="3" style={{ textAlign:'center', padding:'20px' }}>Sin datos</td></tr> : null}
              {chunk.map((s) => (
                <React.Fragment key={s.id}>
                  {/* Fila Principal del Tutorado */}
                  <tr style={{ backgroundColor: '#eef2f5', borderTop: '2px solid #ccc' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold', color: '#2c3e50' }}>Tutorado: {s.name}</td>
                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50' }}>Promedio Gral: {s.average}</td>
                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50' }}>{s.academicStatus}</td>
                  </tr>
                  {/* Filas de sus Materias */}
                  {s.subjectsDetail && s.subjectsDetail.length > 0 ? (
                    s.subjectsDetail.map((subj, sIdx) => (
                      <tr key={`${s.id}-subj-${sIdx}`} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '6px 8px 6px 30px', color: '#555' }}>↳ {subj.subject}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>{subj.grade}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '2px 6px', borderRadius: '4px', fontSize: '11px',
                            backgroundColor: subj.status === 'reprobada' ? '#fdf3f2' : subj.status === 'aprobada' ? '#f2fcf5' : '#fff8e6',
                            color: subj.status === 'reprobada' ? '#e74c3c' : subj.status === 'aprobada' ? '#27ae60' : '#f39c12'
                          }}>
                            {subj.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td colSpan="3" style={{ padding: '6px 8px 6px 30px', color: '#999', fontStyle: 'italic' }}>Sin materias registradas en este momento.</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </Section>
      ))}
    </div>
  );
});

export default TutorReportTemplate;
