import { jsPDF } from 'jspdf';

// ──────────────────────────────────────────────────────
// Colores del tema
// ──────────────────────────────────────────────────────
const C = {
  bg: [250, 250, 252],
  primary: [99, 102, 241],
  success: [34, 197, 94],
  warning: [234, 179, 8],
  error: [239, 68, 68],
  blue: [59, 130, 246],
  text: [15, 23, 42],
  muted: [100, 116, 139],
  border: [226, 232, 240],
  white: [255, 255, 255],
  rowAlt: [248, 250, 252],
};

// ──────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────
const PW = 216; // Letter width mm
const PH = 279; // Letter height mm
const ML = 12;  // Margin left
const MR = 12;  // Margin right
const CW = PW - ML - MR; // Content width

const setFont = (doc, size, style = 'normal', color = C.text) => {
  doc.setFontSize(size);
  doc.setFont('helvetica', style);
  doc.setTextColor(...color);
};

const drawRect = (doc, x, y, w, h, fillColor, borderColor = null) => {
  doc.setFillColor(...fillColor);
  if (borderColor) {
    doc.setDrawColor(...borderColor);
    doc.rect(x, y, w, h, 'FD');
  } else {
    doc.setDrawColor(...fillColor);
    doc.rect(x, y, w, h, 'F');
  }
};

const drawHeaderBand = (doc, title, y) => {
  drawRect(doc, ML, y, CW, 7, C.primary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text(title, ML + 3, y + 5);
  return y + 10;
};

const drawPageHeader = (doc, tutorName, dateStr, pageLabel) => {
  // Banda superior
  drawRect(doc, 0, 0, PW, 18, C.primary);
  setFont(doc, 14, 'bold', C.white);
  doc.text('Reporte de Desempeño de Tutorados', ML, 9);
  setFont(doc, 8, 'normal', C.white);
  doc.text(`Tutor: ${tutorName}   |   ${dateStr}   |   ${pageLabel}`, ML, 15);
};

const addFooter = (doc, pageNum, totalPages) => {
  doc.setDrawColor(...C.border);
  doc.line(ML, PH - 8, PW - MR, PH - 8);
  setFont(doc, 7, 'normal', C.muted);
  doc.text(`Página ${pageNum} / ${totalPages}`, PW / 2, PH - 4, { align: 'center' });
};

// Dibujar una tabla genérica
const drawTable = (doc, y, columns, rows, options = {}) => {
  const colWidths = options.colWidths || columns.map(() => CW / columns.length);
  const ROW_H = options.rowH || 7;
  const HEADER_H = 8;
  let cx = ML;

  // Cabecera
  drawRect(doc, ML, y, CW, HEADER_H, C.bg);
  columns.forEach((col, i) => {
    setFont(doc, 7.5, 'bold', C.muted);
    doc.text(col, cx + 2, y + 5.5);
    // Borde derecho vertical
    doc.setDrawColor(...C.border);
    doc.line(cx, y, cx, y + HEADER_H);
    cx += colWidths[i];
  });
  doc.setDrawColor(...C.border);
  doc.line(ML, y + HEADER_H, ML + CW, y + HEADER_H);
  y += HEADER_H;

  // Filas
  rows.forEach((row, rIdx) => {
    const bg = rIdx % 2 === 0 ? C.white : C.rowAlt;
    drawRect(doc, ML, y, CW, ROW_H, bg);
    cx = ML;
    row.forEach((cell, i) => {
      const align = options.aligns?.[i] || 'left';
      const cellColor = options.cellColors?.[rIdx]?.[i] || C.text;
      const fontStyle = options.bold?.[i] ? 'bold' : 'normal';
      setFont(doc, 7, fontStyle, cellColor);
      const textX = align === 'right'
        ? cx + colWidths[i] - 2
        : align === 'center'
          ? cx + colWidths[i] / 2
          : cx + 2;
      doc.text(String(cell ?? ''), textX, y + 5, { align });
      cx += colWidths[i];
    });
    doc.setDrawColor(...C.border);
    doc.line(ML, y + ROW_H, ML + CW, y + ROW_H);
    y += ROW_H;
  });

  return y + 2;
};

// Dibuja una barra horizontal simple
const drawBar = (doc, x, y, maxW, value, maxValue, color) => {
  const filled = maxValue > 0 ? (value / maxValue) * maxW : 0;
  drawRect(doc, x, y, maxW, 5, C.border);
  if (filled > 0) drawRect(doc, x, y, filled, 5, color);
  setFont(doc, 6.5, 'normal', C.muted);
  doc.text(String(value), x + maxW + 2, y + 4);
};

// ──────────────────────────────────────────────────────
// Función principal
// ──────────────────────────────────────────────────────
export const generateTutorPDF = (stats, students, tutorName) => {
  const doc = new jsPDF({ format: 'letter', orientation: 'portrait', unit: 'mm' });
  const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  let pageNum = 1;
  const totalPagesEst = 5 + Math.ceil(students.length / 18);

  // ─────────────────────────────────────────────────────
  // PÁGINA 1: Resumen + Gráficas de barras
  // ─────────────────────────────────────────────────────
  drawPageHeader(doc, tutorName, dateStr, 'Resumen Ejecutivo');

  let y = 24;

  // Tarjetas KPI
  const kpiW = (CW - 4) / 3;
  const kpis = [
    { label: 'Total Alumnos', value: stats.totalStudents, color: C.primary },
    { label: 'En Riesgo', value: stats.studentsAtRisk, color: C.error },
    { label: 'Cumplimiento', value: `${stats.complianceRate}%`, color: C.success },
  ];
  kpis.forEach((kpi, i) => {
    const kx = ML + i * (kpiW + 2);
    drawRect(doc, kx, y, kpiW, 18, kpi.color);
    doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.white);
    doc.text(String(kpi.value), kx + kpiW / 2, y + 11, { align: 'center' });
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text(kpi.label, kx + kpiW / 2, y + 16, { align: 'center' });
  });
  y += 24;

  // ── Gráfica: Distribución de Promedios ──
  y = drawHeaderBand(doc, 'Distribución de Promedios por Rango', y);
  const gradeData = stats.gradeDistribution || [];
  const maxG = Math.max(...gradeData.map(d => d.value), 1);
  const gradeColors = [C.success, C.blue, C.warning, C.error];
  gradeData.forEach((d, i) => {
    setFont(doc, 7, 'normal', C.text);
    doc.text(d.name, ML, y + 4);
    drawBar(doc, ML + 55, y - 1, CW - 57, d.value, maxG, gradeColors[i] || C.primary);
    y += 9;
  });
  y += 4;

  // ── Gráfica: Niveles de Riesgo Académico ──
  const riskDist = stats.riskDistribution || [];
  if (riskDist.length > 0) {
    y = drawHeaderBand(doc, 'Distribución de Niveles de Riesgo Académico', y);
    const maxR = Math.max(...riskDist.map(d => d.value), 1);
    const riskColors = [C.success, C.warning, C.error];
    riskDist.forEach((d, i) => {
      setFont(doc, 7, 'normal', C.text);
      doc.text(d.name, ML, y + 4);
      drawBar(doc, ML + 55, y - 1, CW - 57, d.value, maxR, riskColors[i] || C.primary);
      y += 9;
    });
    y += 4;
  }

  // ── Gráfica: Materias Reprobadas ──
  const failDist = stats.failedSubjectsDistribution || [];
  if (failDist.length > 0) {
    y = drawHeaderBand(doc, 'Distribución de Materias Reprobadas por Alumno', y);
    const maxF = Math.max(...failDist.map(d => d.value), 1);
    const failColors = [C.success, C.warning, [237, 137, 54], C.error];
    failDist.forEach((d, i) => {
      setFont(doc, 7, 'normal', C.text);
      doc.text(d.name, ML, y + 4);
      drawBar(doc, ML + 55, y - 1, CW - 57, d.value, maxF, failColors[i] || C.error);
      y += 9;
    });
    y += 4;
  }

  // ── Gráfica: Tareas ──
  const taskDist = stats.taskDistribution || [];
  if (taskDist.length > 0) {
    y = drawHeaderBand(doc, 'Estado de Tareas del Grupo', y);
    const maxT = Math.max(...taskDist.map(d => d.value), 1);
    const taskColors = [C.success, C.warning, C.error];
    taskDist.forEach((d, i) => {
      setFont(doc, 7, 'normal', C.text);
      doc.text(d.name, ML, y + 4);
      drawBar(doc, ML + 35, y - 1, CW - 37, d.value, maxT, taskColors[i] || C.primary);
      y += 9;
    });
  }

  addFooter(doc, pageNum, totalPagesEst);

  // ─────────────────────────────────────────────────────
  // PÁGINA 2: Listado General de Alumnos
  // ─────────────────────────────────────────────────────
  doc.addPage();
  pageNum++;
  drawPageHeader(doc, tutorName, dateStr, 'Listado General de Alumnos');
  y = 24;

  const genCols = ['Nombre del Alumno', 'Promedio', 'Mat. Reprobadas', 'Estado Académico'];
  const genWidths = [80, 30, 40, CW - 80 - 30 - 40];

  const statusColor = (status) =>
    status === 'Riesgo Alto' ? C.error : status === 'En Curso' ? C.warning : C.success;

  const genRows = students.map(s => [
    s.name,
    s.average > 0 ? Number(s.average).toFixed(1) : '—',
    s.failedSubjects,
    s.academicStatus
  ]);
  const genCellColors = students.map(s => [
    C.text, C.text, s.failedSubjects > 0 ? C.error : C.text, statusColor(s.academicStatus)
  ]);

  y = drawHeaderBand(doc, `Total: ${students.length} alumnos tutorados`, y);
  y = drawTable(doc, y, genCols, genRows, {
    colWidths: genWidths,
    aligns: ['left', 'center', 'center', 'center'],
    cellColors: genCellColors,
    bold: [false, false, false, true]
  });

  addFooter(doc, pageNum, totalPagesEst);

  // ─────────────────────────────────────────────────────
  // PÁGINA 3: Alumnos en Riesgo Crítico
  // ─────────────────────────────────────────────────────
  doc.addPage();
  pageNum++;
  drawPageHeader(doc, tutorName, dateStr, 'Atención: Alumnos en Riesgo Crítico');
  y = 24;

  const atRisk = students.filter(s => s.failedSubjects >= 1 || s.academicStatus === 'Riesgo Alto');

  if (atRisk.length === 0) {
    setFont(doc, 10, 'normal', C.muted);
    doc.text('¡Excelente! Ningún alumno se encuentra en riesgo crítico.', ML, y + 10);
  } else {
    const riskCols = ['Nombre', 'Promedio', 'Reprobadas', 'Pend.', 'Vencidas'];
    const riskW = [80, 25, 30, 22, CW - 80 - 25 - 30 - 22];
    const riskRows = atRisk.map(s => [
      s.name,
      s.average > 0 ? Number(s.average).toFixed(1) : '—',
      s.failedSubjects,
      s.taskStats?.pending || 0,
      s.taskStats?.overdue || 0,
    ]);
    const riskCC = atRisk.map(s => [C.text, C.error, C.error, C.warning, C.error]);

    y = drawHeaderBand(doc, `${atRisk.length} alumno(s) requieren atención inmediata`, y);
    y = drawTable(doc, y, riskCols, riskRows, {
      colWidths: riskW,
      aligns: ['left', 'center', 'center', 'center', 'center'],
      cellColors: riskCC,
    });
  }

  addFooter(doc, pageNum, totalPagesEst);

  // ─────────────────────────────────────────────────────
  // PÁGINA 4: Alumnos Sobresalientes
  // ─────────────────────────────────────────────────────
  doc.addPage();
  pageNum++;
  drawPageHeader(doc, tutorName, dateStr, 'Desempeño Sobresaliente');
  y = 24;

  const outstanding = students.filter(s => parseFloat(s.average) >= 90 && s.failedSubjects === 0);

  if (outstanding.length === 0) {
    setFont(doc, 10, 'normal', C.muted);
    doc.text('Aún no hay alumnos con promedio mayor o igual a 90 y sin reprobadas.', ML, y + 10);
  } else {
    const outCols = ['Nombre', 'Promedio', 'Tareas Entregadas', 'Estado'];
    const outW = [80, 25, 45, CW - 80 - 25 - 45];
    const outRows = outstanding.map(s => [
      s.name,
      Number(s.average).toFixed(1),
      s.taskStats?.completed || 0,
      'Excelente',
    ]);
    const outCC = outstanding.map(() => [C.text, C.success, C.text, C.success]);

    y = drawHeaderBand(doc, `${outstanding.length} alumno(s) con rendimiento excepcional`, y);
    y = drawTable(doc, y, outCols, outRows, {
      colWidths: outW,
      aligns: ['left', 'center', 'center', 'center'],
      cellColors: outCC,
      bold: [false, true, false, true]
    });
  }

  addFooter(doc, pageNum, totalPagesEst);

  // ─────────────────────────────────────────────────────
  // PÁGINAS 5+: Desglose de materias por alumno (6 por página)
  // ─────────────────────────────────────────────────────
  const STUDENTS_PER_PAGE = 5;
  for (let i = 0; i < students.length; i += STUDENTS_PER_PAGE) {
    doc.addPage();
    pageNum++;
    const pageLabel = `Desglose por Alumno (Pág. ${Math.ceil((i + 1) / STUDENTS_PER_PAGE)} / ${Math.ceil(students.length / STUDENTS_PER_PAGE)})`;
    drawPageHeader(doc, tutorName, dateStr, pageLabel);
    y = 24;

    const chunk = students.slice(i, i + STUDENTS_PER_PAGE);
    chunk.forEach((s) => {
      // Fila de encabezado del alumno
      drawRect(doc, ML, y, CW, 8, C.primary);
      setFont(doc, 8, 'bold', C.white);
      doc.text(`Tutorado: ${s.name}`, ML + 3, y + 5.5);
      const statusStr = `${s.academicStatus}  |  Prom. Gral: ${s.average > 0 ? Number(s.average).toFixed(1) : '—'}  |  Reprobadas: ${s.failedSubjects}`;
      doc.text(statusStr, ML + CW - 3, y + 5.5, { align: 'right' });
      y += 9;

      if (!s.subjectsDetail || s.subjectsDetail.length === 0) {
        setFont(doc, 7, 'italic', C.muted);
        doc.text('Sin materias registradas.', ML + 4, y + 4);
        y += 8;
      } else {
        const subjCols = ['Materia', 'Calificación', 'Estado'];
        const subjW = [100, 35, CW - 100 - 35];
        const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : '—';
        const subjRows = s.subjectsDetail.map(d => [d.subject, d.grade ?? '—', capitalize(d.status)]);
        const subjCC = s.subjectsDetail.map(d => [
          C.text,
          C.text,
          d.status === 'reprobada' ? C.error : d.status === 'aprobada' ? C.success : C.warning,
        ]);

        y = drawTable(doc, y, subjCols, subjRows, {
          colWidths: subjW,
          aligns: ['left', 'center', 'center'],
          cellColors: subjCC,
        });
      }
      y += 4;
    });

    addFooter(doc, pageNum, totalPagesEst);
  }

  doc.save(`Reporte_Tutorados_${new Date().toISOString().split('T')[0]}.pdf`);
};
