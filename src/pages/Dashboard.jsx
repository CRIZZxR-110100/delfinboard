import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import TutorDashboard from './TutorDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  return user.role === 'tutor' ? <TutorDashboard /> : <StudentDashboard />;
};

export default Dashboard;
