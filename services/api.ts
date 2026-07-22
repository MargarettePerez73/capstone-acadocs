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

  updateProfile: async (id: number | string, data: { name: string; email: string }) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  changePassword: async (id: number | string, currentPassword: string, newPassword: string) => {
    const response = await api.put(`/users/${id}/password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  uploadPhoto: async (id: number | string, photo: { uri: string; name: string; type: string }) => {
    const formData = new FormData();
    formData.append('photo', photo as any);
    const response = await api.post(`/users/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  removePhoto: async (id: number | string) => {
    const response = await api.delete(`/users/${id}/photo`);
    return response.data;
  },

  avatarUrl: (photo?: string | null) =>
    photo ? `${api.defaults.baseURL}/avatars/${photo}` : null,
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
// ANNOUNCEMENTS API (view-only)
// ============================================================

export const announcementsAPI = {
  getAll: async (type?: string) => {
    const params = type ? { type } : {};
    const response = await api.get('/announcements', { params });
    return response.data;
  },
};

// ============================================================
// NOTIFICATIONS API (view + mark-read)
// ============================================================

export const notificationsAPI = {
  getAll: async (userId: number | string) => {
    const response = await api.get('/notifications', { params: { user_id: userId } });
    return response.data;
  },

  markAsRead: async (id: number, userId: number | string) => {
    const response = await api.put(`/notifications/${id}/read`, { user_id: userId });
    return response.data;
  },
};

// ============================================================
// TEMPLATES API (view + download)
// ============================================================

export const templatesAPI = {
  getAll: async (categoryId?: number) => {
    const params = categoryId ? { category_id: categoryId } : {};
    const response = await api.get('/templates', { params });
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/template-categories');
    return response.data;
  },

  downloadUrl: (id: number | string) => `${api.defaults.baseURL}/templates/${id}/download`,
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
