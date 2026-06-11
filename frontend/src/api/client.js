import axios from 'axios';

// ─── AXIOS CLIENT WITH JWT INTERCEPTOR ────────────────────
//
// Central API client used by all frontend pages.
// Automatically attaches the JWT token from localStorage
// to every request.
//
// ⚠️ PITFALL (from instructions):
//   The interceptor must read localStorage on EVERY request —
//   not once at init. Otherwise the token won't survive browser
//   refreshes (localStorage persists, but the variable doesn't).
// ──────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const client = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 0, // 0 means NO timeout. The browser will wait as long as the backend takes.
});

// ── Request Interceptor: Attach JWT ──
// Reads from localStorage on EVERY request (not cached)
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('preppilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle auth errors ──
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('preppilot_token');
      localStorage.removeItem('preppilot_user');

      // Only redirect if not already on login/register page
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── AUTH HELPERS ─────────────────────────────────────────

export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
};

// ─── SESSION HELPERS ──────────────────────────────────────

export const sessionAPI = {
  extractResume: (formData) => client.post('/sessions/extract-resume', formData, {
    transformRequest: [(data, headers) => {
      delete headers['Content-Type'];
      return data;
    }]
  }),
  start: (data) => client.post('/sessions/start', data),
  list: () => client.get('/sessions'),
  getById: (id) => client.get(`/sessions/${id}`),
  sendMessage: (id, content, code_submission = null) => client.post(`/sessions/${id}/message`, { content, code_submission }),
  end: (id) => client.post(`/sessions/${id}/end`),
  updateResume: (id, resume_text) => client.post(`/sessions/${id}/resume`, { resume_text }),
};

// ─── COMPILER HELPERS ─────────────────────────────────────

export const compilerAPI = {
  run: (data) => client.post('/compiler/run', data),
  languages: () => client.get('/compiler/languages'),
};

// ─── PROBLEM HELPERS ──────────────────────────────────────

export const problemAPI = {
  fetch: (params) => client.get('/problems/fetch', { params }),
  getBySlug: (slug) => client.get(`/problems/${slug}`),
};

// ─── REPORT HELPERS ───────────────────────────────────────

export const reportAPI = {
  get: (sessionId) => client.get(`/reports/${sessionId}`),
};

// ─── TRANSCRIPTION HELPERS ────────────────────────────────

export const transcribeAPI = {
  /** Send an audio Blob to Groq Whisper for transcription */
  transcribe: (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    return client.post('/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000, // 30s timeout for transcription
    });
  },
};

export default client;
