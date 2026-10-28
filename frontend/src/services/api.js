const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Generic Fetch wrapper with JSON parsing and error handling
 */
async function request(endpoint, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ----------------------------------------------------
// Health Check
// ----------------------------------------------------
export async function getHealth() {
  return request('/api/health');
}

// ----------------------------------------------------
// Events Endpoints
// ----------------------------------------------------
export async function getEvents(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.append('search', params.search);
  if (params.category && params.category !== 'All') searchParams.append('category', params.category);
  if (params.sort) searchParams.append('sort', params.sort);

  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return request(`/api/events${query}`);
}

export async function getEventById(id, token = null) {
  return request(`/api/events/${id}`, {}, token);
}

export async function createEvent(eventData, token) {
  return request('/api/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  }, token);
}

export async function updateEvent(id, eventData, token) {
  return request(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  }, token);
}

export async function deleteEvent(id, token) {
  return request(`/api/events/${id}`, {
    method: 'DELETE',
  }, token);
}

// ----------------------------------------------------
// Registrations Endpoints (Student)
// ----------------------------------------------------
export async function registerForEvent(eventId, token) {
  return request(`/api/events/${eventId}/register`, {
    method: 'POST',
  }, token);
}

export async function cancelRegistration(eventId, token) {
  return request(`/api/events/${eventId}/register`, {
    method: 'DELETE',
  }, token);
}

export async function getMyEvents(token) {
  return request('/api/my-events', {}, token);
}

// ----------------------------------------------------
// Profile Endpoints
// ----------------------------------------------------
export async function getProfile(token) {
  return request('/api/profile', {}, token);
}

export async function updateProfile(profileData, token) {
  return request('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }, token);
}

// ----------------------------------------------------
// Admin Endpoints
// ----------------------------------------------------
export async function getAdminDashboard(token) {
  return request('/api/admin/dashboard', {}, token);
}

export async function getAdminEventRegistrations(eventId, token) {
  return request(`/api/admin/events/${eventId}/registrations`, {}, token);
}

// ----------------------------------------------------
// AI Assistant Endpoint
// ----------------------------------------------------
export async function askAIAssistant(message, history = []) {
  return request('/api/ai/assistant', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

export async function configureGeminiKey(apiKey) {
  return request('/api/ai/configure-key', {
    method: 'POST',
    body: JSON.stringify({ apiKey }),
  });
}

export async function getAIStatus() {
  return request('/api/ai/status');
}
