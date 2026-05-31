import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Loader2, Save, Bell, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { requestNotificationPermissionAndSubscribe } from '../utils/notifications';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      addToast('Nombre y correo son requeridos', 'error');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(formData);
      addToast('Perfil actualizado correctamente', 'success');
      setIsEditing(false);
    } catch (err) {
      addToast(err.message || 'Error al actualizar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    const success = await requestNotificationPermissionAndSubscribe();
    if (success) {
      addToast('Notificaciones activadas exitosamente', 'success');
    } else {
      addToast('No se pudieron activar las notificaciones', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container fade-in">
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '1rem', display: 'flex', justifyContent: 'flex-start' }}>
        <button className="btn-secondary" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <ArrowLeft size={18} /> Volver al Tablero
        </button>
      </div>
      <div className="profile-card glass-panel">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-title">
            <h2>Mi Perfil</h2>
            <p className="text-muted">Gestiona tu información personal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="input-group">
            <label className="input-label">Nombre Completo</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                name="name"
                className="input-field with-icon"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing || loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Correo Electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                name="email"
                className="input-field with-icon"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing || loading}
              />
            </div>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => setIsEditing(true)}
              >
                Editar Perfil
              </button>
            ) : (
              <>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: user.name, email: user.email });
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading || (formData.name === user.name && formData.email === user.email)}
                >
                  {loading ? <><Loader2 className="spinner" /> Guardando...</> : <><Save size={18} /> Guardar Cambios</>}
                </button>
              </>
            )}
          </div>
        </form>

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'hsla(0,0%,50%,0.05)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} /> Notificaciones
          </h3>
          <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
            Activa las notificaciones para recibir alertas cuando tu tutor te asigne nuevas tareas o calificaciones.
          </p>
          <button onClick={handleSubscribe} className="btn-secondary" style={{ width: '100%' }}>
            Habilitar Notificaciones Push
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
