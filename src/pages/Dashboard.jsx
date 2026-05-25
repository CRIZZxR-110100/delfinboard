import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import TutorDashboard from './TutorDashboard';
import JoinTutor from '../components/JoinTutor';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === 'tutor') {
    return <TutorDashboard />;
  }

  // Lógica para Alumnos: si no tiene tutor o está pendiente/baja, mostrar pantalla de bloqueo
  if (!user.tutorId || user.status !== 'active') {
    return <JoinTutor />;
  }

  return <StudentDashboard />;
};

export default Dashboard;
