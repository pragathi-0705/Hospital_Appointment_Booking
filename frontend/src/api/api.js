const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Helper to get auth header
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = localStorage.getItem('pulse_care_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Generic fetch wrapper with clean error extraction
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(options.auth !== false),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const authApi = {
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      auth: false,
    }),
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      auth: false,
    }),
  getMe: () => request('/auth/me', { method: 'GET' }),
};

export const doctorApi = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.specialization && params.specialization !== 'All') searchParams.append('specialization', params.specialization);
    if (params.search) searchParams.append('search', params.search);
    if (params.date) searchParams.append('date', params.date);
    const queryString = searchParams.toString();
    return request(`/doctors${queryString ? `?${queryString}` : ''}`, { method: 'GET', auth: false });
  },
  getById: (id) => request(`/doctors/${id}`, { method: 'GET', auth: false }),
  getAvailability: (doctorId, date) =>
    request(`/doctors/${doctorId}/availability?date=${date}`, { method: 'GET', auth: false }),
  getSpecializations: () => request('/doctors/meta/specializations', { method: 'GET', auth: false }),
  createDoctor: (doctorData) =>
    request('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    }),
  updateDoctor: (id, doctorData) =>
    request(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData),
    }),
  deleteDoctor: (id) =>
    request(`/doctors/${id}`, {
      method: 'DELETE',
    }),
  addLeave: (doctorId, leaveData) =>
    request(`/doctors/${doctorId}/leave`, {
      method: 'POST',
      body: JSON.stringify(leaveData),
    }),
  removeLeave: (doctorId, leaveData) =>
    request(`/doctors/${doctorId}/leave`, {
      method: 'DELETE',
      body: JSON.stringify(leaveData),
    }),
};

export const appointmentApi = {
  book: (bookingData) =>
    request('/appointments/book', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),
  getMyAppointments: (status = 'all') =>
    request(`/appointments/my-appointments?status=${status}`, { method: 'GET' }),
  getById: (id) => request(`/appointments/${id}`, { method: 'GET' }),
  cancel: (id, cancellationReason) =>
    request(`/appointments/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason }),
    }),
  getAllAdmin: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.doctorId) searchParams.append('doctorId', params.doctorId);
    if (params.status && params.status !== 'all') searchParams.append('status', params.status);
    if (params.date) searchParams.append('date', params.date);
    if (params.search) searchParams.append('search', params.search);
    const qs = searchParams.toString();
    return request(`/appointments${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },
  updateStatus: (id, updateData) =>
    request(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),
};

export const adminApi = {
  getStats: () => request('/admin/stats', { method: 'GET' }),
};
