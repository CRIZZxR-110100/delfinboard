const HOST = window.location.hostname;
const API_URL = import.meta.env.VITE_API_URL || `http://${HOST}:5000/api`;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al iniciar sesión');
    return data;
  },
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al registrarse');
    return data;
  }
};

export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al obtener perfil');
    return data;
  },
  updateProfile: async (userData) => {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al actualizar perfil');
    return data;
  },
  getMyMessages: async () => {
    const response = await fetch(`${API_URL}/user/messages`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al obtener mensajes');
    return data;
  }
};

export const gradesAPI = {
  getMyGrades: async () => {
    const response = await fetch(`${API_URL}/grades`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al obtener calificaciones');
    return data;
  },
  addOrUpdateGrade: async (gradeData) => {
    const response = await fetch(`${API_URL}/grades`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(gradeData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al guardar calificación');
    return data;
  }
};

export const tutorAPI = {
  getDashboardStats: async () => {
    const response = await fetch(`${API_URL}/tutor/dashboard-stats`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al obtener estadísticas');
    return data;
  },
  getStudentsList: async () => {
    const response = await fetch(`${API_URL}/tutor/students`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al obtener alumnos');
    return data;
  },
  sendMessage: async (messageData) => {
    const response = await fetch(`${API_URL}/tutor/message`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(messageData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al enviar mensaje');
    return data;
  }
};

export const academicAPI = {
  getSubjects: async () => {
    const response = await fetch(`${API_URL}/academic/subjects`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al obtener materias');
    return data;
  },
  addSubject: async (subjectData) => {
    const response = await fetch(`${API_URL}/academic/subject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subjectData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al agregar materia');
    return data;
  },
  addPartialGrade: async (partialData) => {
    const response = await fetch(`${API_URL}/academic/partial`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(partialData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al agregar calificación parcial');
    return data;
  },
  getTasks: async () => {
    const response = await fetch(`${API_URL}/academic/tasks`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al obtener tareas');
    return data;
  },
  addTask: async (taskData) => {
    const response = await fetch(`${API_URL}/academic/task`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al agregar tarea');
    return data;
  },
  updateTaskStatus: async (taskId, status) => {
    const response = await fetch(`${API_URL}/academic/task/${taskId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al actualizar tarea');
    return data;
  },
  updateSubject: async (id, subjectData) => {
    const response = await fetch(`${API_URL}/academic/subject/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(subjectData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al actualizar materia');
    return data;
  },
  updatePartialGrade: async (id, partialData) => {
    const response = await fetch(`${API_URL}/academic/partial/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(partialData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al actualizar calificación parcial');
    return data;
  },
  updateTask: async (id, taskData) => {
    const response = await fetch(`${API_URL}/academic/task/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al actualizar tarea');
    return data;
  }
};
