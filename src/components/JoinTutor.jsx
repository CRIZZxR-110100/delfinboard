import React, { useState } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, Key, Loader2, AlertCircle } from 'lucide-react';

const JoinTutor = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Si el alumno está rechazado o en baja
  if (user?.status === 'baja') {
    return (
      <div className="main-content flex-center" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ color: 'hsl(0, 84%, 60%)', marginBottom: '1rem' }}>
            <AlertCircle size={48} style={{ margin: '0 auto' }} />
          </div>
          <h2>Acceso Denegado</h2>
          <p className="text-muted" style={{ marginTop: '1rem' }}>
            Tu cuenta ha sido rechazada o dada de baja por tu tutor. No puedes acceder al panel.
          </p>
        </div>
      </div>
    );
  }

  // Si el alumno ya envió el código y está pendiente
  if (user?.status === 'pending') {
    return (
      <div className="main-content flex-center" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ color: 'hsl(45, 100%, 50%)', marginBottom: '1rem' }}>
            <Loader2 size={48} className="spinner" style={{ margin: '0 auto' }} />
          </div>
          <h2>Esperando Aprobación</h2>
          <p className="text-muted" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            Tu solicitud fue enviada correctamente. Debes esperar a que tu tutor apruebe tu cuenta para poder ingresar al panel.
          </p>
          <button 
            className="btn-secondary" 
            onClick={() => window.location.reload()}
            style={{ margin: '0 auto' }}
          >
            Refrescar Estado
          </button>
        </div>
      </div>
    );
  }

  // Vista para ingresar el código
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!code.trim()) {
      setError('Por favor, ingresa el código del tutor.');
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.joinTutor(code.trim());
      // Forzar actualización del contexto con la respuesta del backend
      // Hacemos que AuthContext actualice su estado con getProfile o seteando la info:
      window.location.reload(); 
    } catch (err) {
      setError(err.message || 'Error al validar el código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content flex-center" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '450px', width: '100%' }}>
        <div style={{ color: 'hsl(var(--primary))', marginBottom: '1rem' }}>
          <LogIn size={48} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Únete a un Tutor</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          Ingresa el código de 6 caracteres que te proporcionó tu tutor para continuar.
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="input-group">
            <label className="input-label">Código de Invitación</label>
            <div className="input-wrapper">
              <Key className="input-icon" size={18} />
              <input
                type="text"
                className={`input-field with-icon ${error ? 'error' : ''}`}
                placeholder="Ej. A1B2C3"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={loading}
                maxLength={6}
                style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}
              />
            </div>
            {error && <span className="error-message"><AlertCircle size={14} /> {error}</span>}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? <><Loader2 className="spinner" /> Validando...</> : 'Solicitar Acceso'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinTutor;
