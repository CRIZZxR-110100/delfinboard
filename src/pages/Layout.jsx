import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Users, Home, Menu, X, BookOpen, CheckSquare, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { tutorAPI } from '../services/api';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const fetchPending = async () => {
    if (user?.role === 'tutor') {
      try {
        const data = await tutorAPI.getPendingStudents();
        setPendingStudents(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchPending();
  }, [user]);

  const handleApprove = async (id) => {
    try {
      await tutorAPI.approveStudent(id);
      addToast('Alumno aprobado correctamente', 'success');
      fetchPending();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await tutorAPI.rejectStudent(id);
      addToast('Solicitud rechazada', 'success');
      fetchPending();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleLogout = () => {
    logout();
    addToast('Sesión cerrada correctamente', 'success');
    navigate('/login');
  };

  const closeMenus = () => {
    setDropdownOpen(false);
  };

  useEffect(() => {
    const path = location.pathname;
    let title = 'DelfinBoard';

    if (path === '/') title = 'DelfinBoard - Inicio';
    else if (path === '/perfil') title = 'DelfinBoard - Mi Perfil';
    else if (path === '/materias') title = 'DelfinBoard - Mis Materias';
    else if (path === '/tareas') title = 'DelfinBoard - Mis Tareas';
    else if (path === '/tutor/alumnos') title = 'DelfinBoard - Lista de Tutorados';
    else if (path === '/tutor/materias') title = 'DelfinBoard - Control de Materias';

    document.title = title;
  }, [location]);

  return (
    <div className="layout">
      {/* Navbar que topa a las orillas */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="navbar-brand" style={{ userSelect: 'none' }}>
            <span className="brand-logo"><GraduationCap size={24} /></span>
            <span className="brand-text">DelfinBoard</span>
          </div>
        </div>

        <div className="navbar-right">
          {user?.role === 'tutor' && user?.invitationCode && (
            <div className="navbar-tutor-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="nav-tutor-code" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'hsla(var(--primary), 0.1)', borderRadius: '8px', border: '1px solid hsla(var(--primary), 0.2)' }} title="Comparte este código con tus alumnos">
                <span className="hide-on-mobile" style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'hsl(var(--text-muted))' }}>Código:</span>
                <strong style={{ color: 'hsl(var(--primary))', letterSpacing: '1px' }}>{user.invitationCode}</strong>
              </div>
              <button className="btn-secondary btn-sm nav-solicitudes-btn" onClick={() => setShowPendingModal(true)} style={{ position: 'relative', marginRight: '1rem' }}>
                <span className="hide-on-mobile">Solicitudes</span>
                <span className="show-on-mobile" style={{ display: 'none' }}><Users size={16}/></span>
                {pendingStudents.length > 0 && (
                  <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'hsl(0, 84%, 60%)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {pendingStudents.length}
                  </span>
                )}
              </button>
            </div>
          )}
          <div className="profile-menu-container">
            <button className="profile-btn" onClick={() => setDropdownOpen(!isDropdownOpen)}>
              <div className="avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
              <span className="profile-name">{user?.name?.split(' ')[0]}</span>
            </button>
            
            {/* Dropdown del Perfil */}
            {isDropdownOpen && (
              <div className="profile-dropdown glass-panel">
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid hsla(0,0%,50%,0.2)' }}>
                  <p style={{ margin: 0, fontWeight: '600' }}>{user?.name}</p>
                  <small style={{ color: 'hsl(var(--text-muted))' }}>{user?.email}</small>
                </div>
                <Link to="/perfil" className="dropdown-item" onClick={closeMenus}>
                  <User size={16} /> Mi Perfil
                </Link>
                <button onClick={handleLogout} className="dropdown-item text-danger">
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content" onClick={() => isDropdownOpen && setDropdownOpen(false)}>
        <Outlet />
      </main>

      {/* --- Modal Solicitudes Pendientes (Global para el Tutor) --- */}
      {showPendingModal && createPortal(
        <div className="modal-overlay fade-in" onClick={() => setShowPendingModal(false)}>
          <div className="modal glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', zIndex: 1000 }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={24} style={{ color: 'hsl(var(--primary))' }} />
              Solicitudes de Alumnos
            </h3>
            
            {pendingStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Actualmente no tienes solicitudes de alumnos esperando para unirse a tu tutoría. Comparte tu código de invitación (<strong>{user?.invitationCode}</strong>) con tus estudiantes para que puedan enlazarse a tu cuenta.
                </p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingStudents.map(student => (
                  <li key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'hsla(var(--text), 0.03)', borderRadius: '8px' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>{student.name}</p>
                      <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>{student.email}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-secondary btn-sm" onClick={() => handleReject(student.id)} style={{ color: 'hsl(var(--error))', borderColor: 'hsla(var(--error), 0.3)' }}>Rechazar</button>
                      <button className="btn-primary btn-sm" onClick={() => handleApprove(student.id)}>Aprobar</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowPendingModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default Layout;
