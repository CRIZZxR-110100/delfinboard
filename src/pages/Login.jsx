import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, BookOpen, Target, BarChart2, Users, AlertTriangle, CheckCircle, TrendingUp, X, LogIn, UserPlus, Play, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Login.css';
import './Dashboard.css'; // Importar layout exacto del TutorDashboard

// ===================== DATOS MOCKUP PARA LA DEMO =====================
const MOCK_RISK_DATA = [
  { name: 'Riesgo Alto', value: 3, color: 'hsl(0, 84%, 60%)' },
  { name: 'En Curso', value: 5, color: 'hsl(45, 100%, 50%)' },
  { name: 'Normal', value: 12, color: 'hsl(142, 71%, 45%)' }
];

const MOCK_TASK_DISTRIBUTION = [
  { name: 'Entregadas', value: 45, color: 'hsl(142, 71%, 45%)' },
  { name: 'En Tiempo', value: 12, color: 'hsl(45, 100%, 50%)' },
  { name: 'Vencidas', value: 8, color: 'hsl(0, 84%, 60%)' }
];

const MOCK_EVOLUTION = [
  { name: 'Parcial 1', promedio: 7.2 },
  { name: 'Parcial 2', promedio: 7.8 },
  { name: 'Parcial 3', promedio: 8.4 }
];

const MOCK_GRADE_DISTRIBUTION = [
  { name: 'Excelente (90-100)', value: 8, color: 'hsl(142, 71%, 45%)' },
  { name: 'Bueno (80-89)', value: 6, color: 'hsl(200, 100%, 50%)' },
  { name: 'Regular (70-79)', value: 4, color: 'hsl(45, 100%, 50%)' },
  { name: 'Deficiente (<70)', value: 2, color: 'hsl(0, 84%, 60%)' }
];

const MOCK_FAILED_SUBJECTS = [
  { name: '0 Reprobadas', value: 12, color: 'hsl(142, 71%, 45%)' },
  { name: '1 Reprobada', value: 5, color: 'hsl(45, 100%, 50%)' },
  { name: '2 Reprobadas', value: 2, color: 'hsl(25, 95%, 53%)' },
  { name: '3+ Reprobadas', value: 1, color: 'hsl(0, 84%, 60%)' }
];

const MOCK_STUDENTS = [
  { id: 1, name: 'Ana García López', average: 9.2, activeSubjects: 5, academicStatus: 'Normal', hasCriticalAlert: false },
  { id: 2, name: 'Carlos Mendoza', average: 5.8, activeSubjects: 4, academicStatus: 'Riesgo Alto', hasCriticalAlert: true },
  { id: 3, name: 'María Fernández', average: 7.4, activeSubjects: 5, academicStatus: 'En Curso', hasCriticalAlert: false },
  { id: 4, name: 'Roberto Sánchez', average: 8.1, activeSubjects: 3, academicStatus: 'Normal', hasCriticalAlert: false },
  { id: 5, name: 'Laura Jiménez', average: 6.3, activeSubjects: 5, academicStatus: 'Riesgo Alto', hasCriticalAlert: true },
];

// ===================== COMPONENTE PRINCIPAL =====================
const Login = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'DelfinBoard - Plataforma Académica';
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'email' && value && !validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: 'Formato de correo inválido' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email) newErrors.email = 'El correo es requerido';
    else if (!validateEmail(formData.email)) newErrors.email = 'Formato de correo inválido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (!isLogin && !formData.name) newErrors.name = 'El nombre es requerido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('Por favor corrige los errores del formulario', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        addToast('¡Bienvenido de vuelta!', 'success');
      } else {
        await register(formData);
        addToast('Registro exitoso. ¡Bienvenido!', 'success');
      }
      navigate('/');
    } catch (err) {
      const errorMsg = err.message || 'Error de autenticación';
      addToast(errorMsg, 'error');
      if (isLogin) {
        setErrors({ email: 'Revisa tu correo electrónico', password: 'Revisa tu contraseña' });
      } else {
        setErrors({ email: errorMsg, password: 'Revisa este campo', name: 'Revisa este campo' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoInteraction = () => {
    setShowAuthModal(true);
  };

  const scrollToDemo = () => {
    setShowDemo(true);
    setTimeout(() => {
      document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // ===================== RENDER =====================
  return (
    <div className="landing-page">

      {/* ========== HERO SECTION ========== */}
      <section className="hero-section">
        <nav className="hero-nav">
          <div className="hero-logo">
            <BarChart2 size={28} />
            <span>DelfinBoard</span>
          </div>
          <div className="hero-nav-actions">
            <button className="btn-ghost" onClick={() => { setIsLogin(true); setShowAuthModal(true); }}>
              <LogIn size={18} /> Iniciar Sesión
            </button>
            <button className="btn-primary btn-sm" onClick={() => { setIsLogin(false); setShowAuthModal(true); }}>
              <UserPlus size={18} /> Registrarse
            </button>
          </div>
        </nav>

        <div className="hero-content fade-in">
          <div className="hero-badge">🎓 Plataforma Académica Inteligente</div>
          <h1 className="hero-title">
            El control total de tu <span className="gradient-text">rendimiento académico</span>
          </h1>
          <p className="hero-subtitle">
            Gestiona materias, da seguimiento a calificaciones parciales, controla tareas y visualiza el progreso de tus tutorados con analíticas en tiempo real.
          </p>
          <div className="hero-actions">
            <button className="btn-primary btn-lg" onClick={scrollToDemo}>
              <Play size={20} /> Ver Demo Interactiva
            </button>
            <button className="btn-secondary btn-lg" onClick={() => { setIsLogin(false); setShowAuthModal(true); }}>
              Crear Cuenta Gratis
            </button>
          </div>
        </div>

        <div className="hero-features">
          <div className="hero-feature-card glass-panel">
            <div className="hero-feature-icon" style={{ background: 'hsla(250, 84%, 54%, 0.1)', color: 'hsl(250, 84%, 54%)' }}>
              <BookOpen size={24} />
            </div>
            <h3>Gestión de Materias</h3>
            <p>Organiza tu retícula y da seguimiento a calificaciones parciales y finales.</p>
          </div>
          <div className="hero-feature-card glass-panel">
            <div className="hero-feature-icon" style={{ background: 'hsla(200, 100%, 50%, 0.1)', color: 'hsl(200, 100%, 50%)' }}>
              <Target size={24} />
            </div>
            <h3>Control de Tareas</h3>
            <p>Administra actividades, fechas de entrega y estado de cada tarea.</p>
          </div>
          <div className="hero-feature-card glass-panel">
            <div className="hero-feature-icon" style={{ background: 'hsla(142, 71%, 45%, 0.1)', color: 'hsl(142, 71%, 45%)' }}>
              <BarChart2 size={24} />
            </div>
            <h3>Analíticas Avanzadas</h3>
            <p>Visualiza progreso mediante gráficos e indicadores clave de rendimiento.</p>
          </div>
        </div>

        <button className="scroll-indicator" onClick={scrollToDemo} aria-label="Ver demo">
          <span>Ver Demo</span>
          <ChevronDown size={24} />
        </button>
      </section>

      <section id="demo-section" className="demo-section fade-in">
        <div className="dashboard" style={{ width: '100%', maxWidth: '1500px', margin: '0 auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="demo-header tutor-viewport-header" style={{ marginBottom: '0', flexShrink: 0 }}>
            <div className="demo-badge">DEMO INTERACTIVA</div>
            <h2>Panel del Tutor <span className="gradient-text">en Acción</span></h2>
            <p className="text-muted">Explora las capacidades del dashboard. Haz clic en cualquier gráfico para interactuar.</p>
          </div>

          <div className="tutor-viewport-container" style={{ flex: 1, minHeight: 0, paddingBottom: 0, marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Stat Cards - Estructura Original de Tutor */}
            <div className="tutor-viewport-stats" style={{ flexShrink: 0, marginBottom: '1rem' }}>
            <div className="stat-card glass-panel" onClick={handleDemoInteraction} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', width: 40, height: 40 }}>
                <Users size={20} />
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.25rem' }}>20</h3>
                <p style={{ fontSize: '0.8rem' }}>Alumnos Tutorados</p>
              </div>
            </div>

            <div className="stat-card glass-panel" onClick={handleDemoInteraction} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'hsla(var(--error), 0.1)', color: 'hsl(var(--error))', width: 40, height: 40 }}>
                <AlertTriangle size={20} />
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.25rem' }}>3</h3>
                <p style={{ fontSize: '0.8rem' }}>Alumnos en Riesgo</p>
              </div>
            </div>

            <div className="stat-card glass-panel" onClick={handleDemoInteraction} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'hsla(var(--secondary), 0.1)', color: 'hsl(var(--secondary))', width: 40, height: 40 }}>
                <CheckCircle size={20} />
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.25rem' }}>69%</h3>
                <p style={{ fontSize: '0.8rem' }}>Tasa de Cumplimiento</p>
              </div>
            </div>
          </div>

          <div className="tutor-viewport-grid">
            {/* Tarjeta 1: Tabla */}
            <div className="tutor-viewport-card glass-panel demo-chart-card" onClick={handleDemoInteraction} style={{ position: 'relative', overflow: 'hidden' }}>
              <h2 className="section-title">Resumen de Tutorados</h2>
              <div className="tutor-viewport-table-container">
                <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Prom.</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_STUDENTS.map(s => (
                      <tr key={s.id} style={s.hasCriticalAlert ? { backgroundColor: 'hsla(0, 84%, 60%, 0.05)' } : {}}>
                        <td style={{ fontWeight: 500 }}>{s.name}</td>
                        <td>{s.average}</td>
                        <td>
                          <span className={`badge badge-risk-${s.academicStatus === 'Riesgo Alto' ? 'alto' : s.academicStatus === 'En Curso' ? 'medio' : 'bajo'}`} style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>
                            {s.academicStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="demo-chart-overlay"><LogIn size={24} /><span>Inicia sesión para interactuar</span></div>
            </div>

            {/* Tarjeta 2: Distribución de Promedios */}
            <div className="tutor-viewport-card glass-panel demo-chart-card" onClick={handleDemoInteraction} style={{ position: 'relative', overflow: 'hidden' }}>
              <h2 className="section-title">Distribución Promedios</h2>
              <div className="tutor-viewport-content">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_GRADE_DISTRIBUTION} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {MOCK_GRADE_DISTRIBUTION.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="demo-chart-overlay"><LogIn size={24} /><span>Inicia sesión para interactuar</span></div>
            </div>

            {/* Tarjeta 3: Alineación de Grupo */}
            <div className="tutor-viewport-card glass-panel demo-chart-card" onClick={handleDemoInteraction} style={{ position: 'relative', overflow: 'hidden' }}>
              <h2 className="section-title">Alineación de Grupo</h2>
              <div className="tutor-viewport-content">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={MOCK_RISK_DATA} innerRadius="50%" outerRadius="80%" paddingAngle={5} dataKey="value">
                      {MOCK_RISK_DATA.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={24} iconSize={10} wrapperStyle={{ fontSize: '0.8rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="demo-chart-overlay"><LogIn size={24} /><span>Inicia sesión para interactuar</span></div>
            </div>

            {/* Tarjeta 4: Evolución */}
            <div className="tutor-viewport-card glass-panel demo-chart-card" onClick={handleDemoInteraction} style={{ position: 'relative', overflow: 'hidden' }}>
              <h2 className="section-title">Evolución de Rendimiento</h2>
              <div className="tutor-viewport-content">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_EVOLUTION} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--text), 0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="promedio" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="demo-chart-overlay"><LogIn size={24} /><span>Inicia sesión para interactuar</span></div>
            </div>

            {/* Tarjeta 5: Gravedad de Rezago */}
            <div className="tutor-viewport-card glass-panel demo-chart-card" onClick={handleDemoInteraction} style={{ position: 'relative', overflow: 'hidden' }}>
              <h2 className="section-title">Gravedad de Rezago</h2>
              <div className="tutor-viewport-content">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_FAILED_SUBJECTS} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {MOCK_FAILED_SUBJECTS.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="demo-chart-overlay"><LogIn size={24} /><span>Inicia sesión para interactuar</span></div>
            </div>

            {/* Tarjeta 6: Cumplimiento de Tareas */}
            <div className="tutor-viewport-card glass-panel demo-chart-card" onClick={handleDemoInteraction} style={{ position: 'relative', overflow: 'hidden' }}>
              <h2 className="section-title">Cumplimiento de Tareas</h2>
              <div className="tutor-viewport-content">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_TASK_DISTRIBUTION} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {MOCK_TASK_DISTRIBUTION.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="demo-chart-overlay"><LogIn size={24} /><span>Inicia sesión para interactuar</span></div>
            </div>
          </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="demo-footer">
          <p>&copy; {new Date().getFullYear()} DelfinBoard. Todos los derechos reservados.</p>
        </footer>
      </section>

      {/* ========== AUTH MODAL ========== */}
      {showAuthModal && (
        <div className="modal-overlay fade-in" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal glass-panel fade-in" onClick={(e) => e.stopPropagation()}>
            <button className="auth-modal-close" onClick={() => setShowAuthModal(false)}>
              <X size={20} />
            </button>

            <div className="auth-modal-header">
              <div className="auth-modal-logo">
                <BarChart2 size={32} style={{ color: 'hsl(250, 84%, 54%)' }} />
              </div>
              <h2>{isLogin ? 'Bienvenido de vuelta' : 'Únete a DelfinBoard'}</h2>
              <p className="text-muted">
                {isLogin ? 'Ingresa tus credenciales para acceder al panel' : 'Crea tu cuenta para empezar a gestionar'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-modal-form">
              {!isLogin && (
                <>
                  <div className="input-group">
                    <label className="input-label">Nombre Completo</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="name"
                        className={`input-field ${errors.name ? 'error' : ''}`}
                        placeholder="Ej. Juan Pérez"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.name && <span className="error-message"><AlertCircle size={14} /> {errors.name}</span>}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Rol en el sistema</label>
                    <div className="input-wrapper">
                      <select name="role" className="input-field" value={formData.role} onChange={handleChange} disabled={loading}>
                        <option value="student">Alumno</option>
                        <option value="tutor">Tutor</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="input-group">
                <label className="input-label">Correo Electrónico</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    name="email"
                    className={`input-field with-icon ${errors.email ? 'error' : ''}`}
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                  />
                </div>
                {errors.email && <span className="error-message"><AlertCircle size={14} /> {errors.email}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Contraseña</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    name="password"
                    className={`input-field with-icon ${errors.password ? 'error' : ''}`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                {errors.password && <span className="error-message"><AlertCircle size={14} /> {errors.password}</span>}
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? <><Loader2 className="spinner" /> Procesando...</> : (isLogin ? 'Ingresar' : 'Registrarse')}
              </button>
            </form>

            <div className="auth-modal-footer">
              <p>
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                  disabled={loading}
                >
                  {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
