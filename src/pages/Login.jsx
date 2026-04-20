import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = isLogin ? 'DelfinBoard - Iniciar Sesión' : 'DelfinBoard - Crear Cuenta';
  }, [isLogin]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
        setErrors({ 
          email: 'Revisa tu correo electrónico', 
          password: 'Revisa tu contraseña' 
        });
      } else {
        setErrors({ 
          email: errorMsg,
          password: 'Revisa este campo',
          name: 'Revisa este campo'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel fade-in">
        <div className="login-header">
          <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
          <p className="text-muted">
            {isLogin ? 'Ingresa tus credenciales para acceder al panel' : 'Regístrate para obtener acceso'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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
                  <select
                    name="role"
                    className="input-field"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                  >
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

        <div className="login-footer">
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
  );
};

export default Login;
