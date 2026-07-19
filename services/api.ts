import api from './axiosConfig';

// ============================================================
// AUTH API
// ============================================================

export const authAPI = {
  // `identifier` may be a username OR an email (the PHP backend accepts both).
  login: async (identifier: string, password: string) => {
    const response = await api.post('/auth/login', { username: identifier, password });
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

export default api;
