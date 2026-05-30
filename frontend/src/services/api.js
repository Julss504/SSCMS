const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Get user data from localStorage
export const getUserData = () => {
  const data = localStorage.getItem('userData');
  return data ? JSON.parse(data) : null;
};

// Set user data in localStorage
export const setUserData = (data) => {
  localStorage.setItem('userData', JSON.stringify(data));
};

// Remove user data from localStorage
export const removeUserData = () => {
  localStorage.removeItem('userData');
};

// Helper to check if user is admin
export const isAdmin = () => {
  const userData = getUserData();
  return userData?.role === 'admin';
};

// Helper to check if user is officer
export const isOfficer = () => {
  const userData = getUserData();
  return userData?.role === 'officer';
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  } else if (!options.headers?.['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (data) => apiRequest('/auth/update-profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getUsers: () => apiRequest('/auth/users'),
  deleteUser: (id) => apiRequest(`/auth/users/${id}`, {
    method: 'DELETE',
  }),
};

// Students API
export const studentsAPI = {
  getAll: () => apiRequest('/students'),
  getOne: (id) => apiRequest(`/students/${id}`),
  create: (studentData) => apiRequest('/students', {
    method: 'POST',
    body: JSON.stringify(studentData),
  }),
  update: (id, studentData) => apiRequest(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(studentData),
  }),
  delete: (id) => apiRequest(`/students/${id}`, {
    method: 'DELETE',
  }),
  registerForEvent: (studentId, eventId) => apiRequest(`/students/${studentId}/register/${eventId}`, {
    method: 'POST',
  }),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/students/import', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Events API
export const eventsAPI = {
  getAll: () => apiRequest('/events'),
  getOne: (id) => apiRequest(`/events/${id}`),
  getUpcoming: () => apiRequest('/events/upcoming'),
  create: (eventData) => apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  }),
  update: (id, eventData) => apiRequest(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  }),
  delete: (id) => apiRequest(`/events/${id}`, {
    method: 'DELETE',
  }),
  updatePaymentStatus: (eventId, studentId, status) => apiRequest(`/events/${eventId}/payment/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// Attendance API
export const attendanceAPI = {
  getAll: () => apiRequest('/attendance'),
  getByEvent: (eventId) => apiRequest(`/attendance/event/${eventId}`),
  getByStudent: (studentId) => apiRequest(`/attendance/student/${studentId}`),
  mark: (attendanceData) => apiRequest('/attendance', {
    method: 'POST',
    body: JSON.stringify(attendanceData),
  }),
  update: (id, attendanceData) => apiRequest(`/attendance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(attendanceData),
  }),
  updateByEvent: (eventId, studentId, data) => apiRequest(`/attendance/event/${eventId}/student/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/attendance/${id}`, {
    method: 'DELETE',
  }),
};
