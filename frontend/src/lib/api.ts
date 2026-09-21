import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('mednivo-auth');
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStorage = localStorage.getItem('mednivo-auth');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          parsed.state.isAuthenticated = false;
          parsed.state.accessToken = null;
          localStorage.setItem('mednivo-auth', JSON.stringify(parsed));
        } catch {}
      }
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth API ──────────────────────────────────────────────────
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.patch('/auth/profile', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
};

// ─── Clinic API ────────────────────────────────────────────────
export const clinicAPI = {
  get: () => api.get('/clinic'),
  update: (data: any) => api.patch('/clinic', data),
  updateSettings: (data: any) => api.patch('/clinic/settings', data),
  getDashboard: () => api.get('/clinic/dashboard'),
  getDoctors: () => api.get('/clinic/doctors'),
};

// ─── Patients API ──────────────────────────────────────────────
export const patientsAPI = {
  getAll: (query?: string) => api.get('/patients', { params: { q: query } }),
  getOne: (id: string) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients', data),
  update: (id: string, data: any) => api.patch(`/patients/${id}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
  getStats: () => api.get('/patients/stats'),
};

// ─── Medicines API ─────────────────────────────────────────────
export const medicinesAPI = {
  search: (query: string) => api.get('/medicines', { params: { q: query } }),
  getAll: () => api.get('/medicines'),
  create: (data: any) => api.post('/medicines', data),
  update: (id: string, data: any) => api.patch(`/medicines/${id}`, data),
  delete: (id: string) => api.delete(`/medicines/${id}`),
};

// ─── Appointments API ──────────────────────────────────────────
export const appointmentsAPI = {
  getAll: (filters?: { date?: string; doctorId?: string; status?: string }) => api.get('/appointments', { params: filters }),
  getToday: () => api.get('/appointments/today'),
  create: (data: any) => api.post('/appointments', data),
  getOne: (id: string) => api.get(`/appointments/${id}`),
  updateStatus: (id: string, status: string, cancelReason?: string) => api.patch(`/appointments/${id}/status`, { status, cancelReason }),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

// ─── Queue API ─────────────────────────────────────────────────
export const queueAPI = {
  getToday: (doctorId?: string) => api.get('/queue/today', { params: { doctorId } }),
  addToQueue: (data: any) => api.post('/queue', data),
  updateStatus: (id: string, status: string) => api.patch(`/queue/${id}/status`, { status }),
  callNext: () => api.post('/queue/call-next'),
  reorder: (id: string, position: number) => api.patch(`/queue/${id}/reorder`, { position }),
};

// ─── Consultations API ─────────────────────────────────────────
export const consultationsAPI = {
  getAll: (filters?: { patientId?: string; doctorId?: string; date?: string }) => api.get('/consultations', { params: filters }),
  getOne: (id: string) => api.get(`/consultations/${id}`),
  create: (data: any) => api.post('/consultations', data),
  update: (id: string, data: any) => api.patch(`/consultations/${id}`, data),
  addVitals: (id: string, data: any) => api.post(`/consultations/${id}/vitals`, data),
  addDiagnosis: (id: string, data: any) => api.post(`/consultations/${id}/diagnosis`, data),
  complete: (id: string) => api.patch(`/consultations/${id}/complete`),
  getPatientHistory: (patientId: string) => api.get(`/consultations/patient/${patientId}/history`),
};

// ─── Prescriptions API ─────────────────────────────────────────
export const prescriptionsAPI = {
  getAll: () => api.get('/prescriptions'),
  getOne: (id: string) => api.get(`/prescriptions/${id}`),
  create: (data: any) => api.post('/prescriptions', data),
  update: (id: string, data: any) => api.patch(`/prescriptions/${id}`, data),
  delete: (id: string) => api.delete(`/prescriptions/${id}`),
};

// ─── Billing API ───────────────────────────────────────────────
export const billingAPI = {
  createInvoice: (data: any) => api.post('/billing/invoices', data),
  getInvoices: (filters?: { status?: string; patientId?: string }) => api.get('/billing/invoices', { params: filters }),
  getInvoice: (id: string) => api.get(`/billing/invoices/${id}`),
  recordPayment: (data: any) => api.post('/billing/payments', data),
  getPayments: (date?: string) => api.get('/billing/payments', { params: { date } }),
  getReceipts: () => api.get('/billing/receipts'),
  getReceipt: (id: string) => api.get(`/billing/receipts/${id}`),
  getFinancialSummary: (period?: string) => api.get('/billing/summary', { params: { period } }),
};

// ─── AI API ────────────────────────────────────────────────────
export const aiAPI = {
  processVoice: (transcript: string) => api.post('/ai/process-voice', { transcript }),
  summarizeHistory: (patientId: string) => api.get(`/ai/summarize/${patientId}`),
};

