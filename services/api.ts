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
// CHAT API — conversations (direct + group) & messages
// ============================================================

export const chatAPI = {
  getConversations: async (userId: number | string) => {
    const response = await api.get('/conversations', { params: { user_id: userId } });
    return response.data;
  },

  // Direct-conversation creation is admin-only server-side.
  startConversation: async (createdBy: number | string, userId: number | string) => {
    const response = await api.post('/conversations', { created_by: createdBy, user_id: userId });
    return response.data;
  },

  getMessages: async (conversationId: number | string) => {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (conversationId: number | string, senderId: number | string, body: string) => {
    const response = await api.post(`/conversations/${conversationId}/messages`, { sender_id: senderId, body });
    return response.data;
  },

  markAsRead: async (conversationId: number | string, userId: number | string) => {
    const response = await api.put(`/conversations/${conversationId}/read`, { user_id: userId });
    return response.data;
  },
};

export default api;
