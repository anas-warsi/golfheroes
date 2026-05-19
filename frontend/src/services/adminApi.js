import api from '../api/axios';

export const adminApi = {
  // Analytics
  getAnalytics: async (signal) => {
    const res = await api.get('/admin/analytics', { signal });
    return res.data;
  },

  // Users Management
  getUsers: async (page = 1, search = '', signal) => {
    const res = await api.get(`/admin/users?page=${page}&search=${search}`, { signal });
    return res.data;
  },

  updateUser: async (id, data) => {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data;
  },

  // Draws Control
  getDraws: async (signal) => {
    const res = await api.get('/admin/draws', { signal });
    return res.data;
  },

  createDraw: async (data) => {
    const res = await api.post('/admin/draws', data);
    return res.data;
  },

  simulateDraw: async (id) => {
    const res = await api.post(`/admin/draws/${id}/simulate`);
    return res.data;
  },

  publishDraw: async (id) => {
    const res = await api.post(`/admin/draws/${id}/publish`);
    return res.data;
  },

  // Winners Management
  getWinners: async (signal) => {
    const res = await api.get('/admin/winners', { signal });
    return res.data;
  },

  verifyWinner: async (id, status) => {
    const res = await api.put(`/admin/winners/${id}/verify`, { status });
    return res.data;
  },

  payoutWinner: async (id, status) => {
    const res = await api.put(`/admin/winners/${id}/payout`, { status });
    return res.data;
  },

  // Charities CRUD
  getCharities: async (signal) => {
    const res = await api.get('/admin/charities', { signal });
    return res.data;
  },

  createCharity: async (data) => {
    const res = await api.post('/admin/charities', data);
    return res.data;
  },

  updateCharity: async (id, data) => {
    const res = await api.put(`/admin/charities/${id}`, data);
    return res.data;
  },

  deleteCharity: async (id) => {
    const res = await api.delete(`/admin/charities/${id}`);
    return res.data;
  },

  // Draw Countdown Settings
  getDrawSettings: async (signal) => {
    const res = await api.get('/draw-settings', { signal });
    return res.data;
  },

  updateDrawSettings: async (data) => {
    const res = await api.put('/admin/draw-settings', data);
    return res.data;
  }
};
