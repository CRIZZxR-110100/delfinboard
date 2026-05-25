import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Layout from './pages/Layout';

import SubjectsList from './pages/SubjectsList';
import TasksList from './pages/TasksList';
import TutorStudentsList from './pages/TutorStudentsList';
import TutorSubjectsList from './pages/TutorSubjectsList';

// Componente para proteger la ruta de login si ya está autenticado
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
};

const AppContent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/perfil" element={<Profile />} />
            
            <Route path="/materias" element={<SubjectsList />} />
            <Route path="/tareas" element={<TasksList />} />

            <Route path="/tutor/alumnos" element={<TutorStudentsList />} />
            <Route path="/tutor/materias" element={<TutorSubjectsList />} />
          </Route>
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
