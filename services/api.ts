import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================================
// AUTH API
// ============================================================

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  getUserById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  updateProfile: async (id: number, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
};

// ============================================================
// USERS API
// ============================================================

export const usersAPI = {
  getAll: async (role?: string) => {
    const params = role ? { role } : {};
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
};

// ============================================================
// SUBMISSIONS API
// ============================================================

export const submissionsAPI = {
  getAll: async (filters?: { user_id?: number; status?: string; type?: string }) => {
    const response = await api.get('/submissions', { params: filters });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/submissions', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/submissions/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/submissions/${id}`);
    return response.data;
  },
  
  getComments: async (submissionId: number) => {
    const response = await api.get(`/submissions/${submissionId}/comments`);
    return response.data;
  },
  
  addComment: async (submissionId: number, data: any) => {
    const response = await api.post(`/submissions/${submissionId}/comments`, data);
    return response.data;
  },
};

// ============================================================
// MPS API
// ============================================================

export const mpsAPI = {
  getAll: async (filters?: { user_id?: number; quarter?: number; school_year?: string; subject?: string }) => {
    const response = await api.get('/mps', { params: filters });
    return response.data;
  },
  
  getStats: async (filters?: { quarter?: number; school_year?: string }) => {
    const response = await api.get('/mps/stats', { params: filters });
    return response.data;
  },
  
  getTrends: async (schoolYear: string, userId?: number) => {
    const params = userId ? { school_year: schoolYear, user_id: userId } : { school_year: schoolYear };
    const response = await api.get('/mps/trends', { params });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/mps', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/mps/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/mps/${id}`);
    return response.data;
  },
};

// ============================================================
// TIME RECORDS API
// ============================================================

export const timeRecordsAPI = {
  getAll: async (filters?: { target_user?: number; start_date?: string; end_date?: string }) => {
    const response = await api.get('/time-records', { params: filters });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/time-records', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/time-records/${id}`, data);
    return response.data;
  },
};

// ============================================================
// ANNOUNCEMENTS API
// ============================================================

export const announcementsAPI = {
  getAll: async (targetRole?: string) => {
    const params = targetRole ? { target_role: targetRole } : {};
    const response = await api.get('/announcements', { params });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/announcements', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/announcements/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },
};

// ============================================================
// DOCUMENT LINKS API
// ============================================================

export const documentLinksAPI = {
  getAll: async (category?: string) => {
    const params = category ? { category } : {};
    const response = await api.get('/document-links', { params });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/document-links', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/document-links/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/document-links/${id}`);
    return response.data;
  },
};

// ============================================================
// ROOM AUDIT API
// ============================================================

export const roomAuditAPI = {
  getAll: async (filters?: { user_id?: number; room_name?: string }) => {
    const response = await api.get('/room-audit', { params: filters });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/room-audit', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/room-audit/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/room-audit/${id}`);
    return response.data;
  },
};

// ============================================================
// CHAT API
// ============================================================

export const chatAPI = {
  getMessages: async (filters?: { sender_id?: number; receiver_id?: number; group_name?: string }) => {
    const response = await api.get('/chat', { params: filters });
    return response.data;
  },
  
  sendMessage: async (data: any) => {
    const response = await api.post('/chat', data);
    return response.data;
  },
  
  markAsRead: async (id: number) => {
    const response = await api.put(`/chat/${id}/read`);
    return response.data;
  },
};

// ============================================================
// NOTIFICATIONS API
// ============================================================

export const notificationsAPI = {
  getAll: async (userId: number, unreadOnly?: boolean) => {
    const params = { user_id: userId, unread_only: unreadOnly };
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/notifications', data);
    return response.data;
  },
  
  markAsRead: async (id: number) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  
  markAllAsRead: async (userId: number) => {
    const response = await api.put('/notifications/read-all', { user_id: userId });
    return response.data;
  },
};

// ============================================================
// HEALTH CHECK
// ============================================================

export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
