import React, { useState, useEffect } from 'react';
import { User, Mail, Loader2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  
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

  if (!user) return null;

  return (
    <div className="profile-container fade-in">
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
      </div>
    </div>
  );
};

export default Profile;
