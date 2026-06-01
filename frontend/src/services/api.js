const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
export const getToken = () => {
  const token = localStorage.getItem('token');
  return token ? token.trim() : null;
};

// Set token in localStorage
export const setToken = (token) => {
  if (token && typeof token === 'string') {
    localStorage.setItem('token', token.trim());
  } else if (token !== null && token !== undefined) {
    localStorage.setItem('token', String(token).trim());
  }
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

// Helper to check if user is student
export const isStudent = () => {
  const userData = getUserData();
  return userData?.role === 'student';
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

  console.log('Fetching URL:', `${API_URL}${endpoint}`);
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      removeUserData();
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  registerStudent: (userData) => apiRequest('/auth/register-student', {
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
  updateUserRole: (id, role) => apiRequest(`/auth/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  createStudentUser: (data) => apiRequest('/auth/create-student-user', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteUser: (id) => apiRequest(`/auth/users/${id}`, {
    method: 'DELETE',
  }),
};

// Students API
export const studentsAPI = {
  getAll: (includeArchived = false) => apiRequest(`/students?archived=${includeArchived ? 'true' : 'false'}`),
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
  archive: (id) => apiRequest(`/students/${id}/archive`, {
    method: 'PATCH',
  }),
  restore: (id) => apiRequest(`/students/${id}/restore`, {
    method: 'PATCH',
  }),
  registerForEvent: (studentId, eventId) => apiRequest(`/students/${studentId}/register/${eventId}`, {
    method: 'POST',
  }),
  registerSelfForEvent: (eventId) => apiRequest(`/students/register-self/${eventId}`, {
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
  getAll: (includeArchived = false) => apiRequest(`/events?archived=${includeArchived ? 'true' : 'false'}`),
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
  archive: (id) => apiRequest(`/events/${id}/archive`, {
    method: 'PATCH',
  }),
  restore: (id) => apiRequest(`/events/${id}/restore`, {
    method: 'PATCH',
  }),
  updatePaymentStatus: (eventId, studentId, status) => apiRequest(`/events/${eventId}/payment/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  approveRegistration: (eventId, studentId) => apiRequest(`/events/${eventId}/approve/${studentId}`, {
    method: 'PUT',
  }),
  disapproveRegistration: (eventId, studentId) => apiRequest(`/events/${eventId}/disapprove/${studentId}`, {
    method: 'PUT',
  }),
};

// Attendance API
export const attendanceAPI = {
  getAll: (includeArchived = false) => apiRequest(`/attendance?archived=${includeArchived ? 'true' : 'false'}`),
  getByEvent: (eventId, includeArchived = false) => apiRequest(`/attendance/event/${eventId}?archived=${includeArchived ? 'true' : 'false'}`),
  getByStudent: (studentId, includeArchived = false) => apiRequest(`/attendance/student/${studentId}?archived=${includeArchived ? 'true' : 'false'}`),
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
  archive: (id) => apiRequest(`/attendance/${id}/archive`, {
    method: 'PATCH',
  }),
  restore: (id) => apiRequest(`/attendance/${id}/restore`, {
    method: 'PATCH',
  }),
};
