import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Users, Home, Menu, X, BookOpen, CheckSquare, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    addToast('Sesión cerrada correctamente', 'success');
    navigate('/login');
  };

  const closeMenus = () => {
    setDrawerOpen(false);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const path = location.pathname;
    let title = 'DelfinBoard';

    if (path === '/') title = 'DelfinBoard - Inicio';
    else if (path === '/perfil') title = 'DelfinBoard - Mi Perfil';
    else if (path === '/materias') title = 'DelfinBoard - Mis Materias';
    else if (path === '/tareas') title = 'DelfinBoard - Mis Tareas';
    else if (path.includes('/materia/nueva')) title = 'DelfinBoard - Nueva Materia';
    else if (path.includes('/materia/ver')) title = 'DelfinBoard - Detalles de Materia';
    else if (path.includes('/materia/editar')) title = 'DelfinBoard - Editar Materia';
    else if (path.includes('/tarea/nueva')) title = 'DelfinBoard - Nueva Tarea';
    else if (path.includes('/tarea/editar')) title = 'DelfinBoard - Editar Tarea';
    else if (path.includes('/calificacion/nueva')) title = 'DelfinBoard - Nueva Calificación';
    else if (path.includes('/calificacion/editar')) title = 'DelfinBoard - Editar Calificación';
    else if (path === '/tutor/alumnos') title = 'DelfinBoard - Lista de Tutorados';
    else if (path === '/tutor/materias') title = 'DelfinBoard - Control de Materias';

    document.title = title;
  }, [location]);

  return (
    <div className="layout">
      {/* Navbar que topa a las orillas */}
      <nav className="navbar">
        <div className="navbar-left">
          <button className="icon-btn" onClick={() => setDrawerOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="navbar-brand" style={{ userSelect: 'none' }}>
            <span className="brand-logo"><GraduationCap size={24} /></span>
            <span className="brand-text">DelfinBoard</span>
          </div>
        </div>

        <div className="navbar-right">
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

      {/* Menú Lateral Hamburgesa (Drawer) */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={closeMenus}></div>
      <div className={`sidebar-drawer glass-panel ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="brand-text" style={{ fontSize: '1.25rem' }}>Menú Principal</span>
          <button className="icon-btn" onClick={() => setDrawerOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <div className="drawer-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMenus}>
            <Home size={20} /> Dashboard
          </Link>

          {user?.role === 'student' && (
            <>
              <Link to="/materias" className={`nav-link ${location.pathname.startsWith('/materia') ? 'active' : ''}`} onClick={closeMenus}>
                <BookOpen size={20} /> Materias
              </Link>
              <Link to="/tareas" className={`nav-link ${location.pathname.startsWith('/tarea') ? 'active' : ''}`} onClick={closeMenus}>
                <CheckSquare size={20} /> Tareas
              </Link>
            </>
          )}

          {user?.role === 'tutor' && (
            <>
              <Link to="/tutor/alumnos" className={`nav-link ${location.pathname.startsWith('/tutor/alumnos') ? 'active' : ''}`} onClick={closeMenus}>
                <Users size={20} /> Tutorados
              </Link>
              <Link to="/tutor/materias" className={`nav-link ${location.pathname.startsWith('/tutor/materias') ? 'active' : ''}`} onClick={closeMenus}>
                <BookOpen size={20} /> Materias del Semestre
              </Link>
            </>
          )}
        </div>
      </div>

      <main className="main-content" onClick={() => isDropdownOpen && setDropdownOpen(false)}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
