import api from './api';

export const adminService = {
    getBlockedUsers: async () => await api.get('/admin/blocked-users'),
    unlockUser: async (id) => await api.put(`/admin/unlock-user/${id}`),
    getUserActivity: async () => await api.get('/admin/user-activity'),
};
