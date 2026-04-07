import api from './api';

/**
 * Servicio de autenticación
 */
export const authService = {
    /**
     * Iniciar sesión
     * @param {object} credentials - { login, password }
     * @returns {Promise} - { success, token, user, forceChangePassword }
     */
    login: async (credentials) => {
        return await api.post('/auth/login', credentials);
    },

    /**
     * Cambiar contraseña
     * @param {object} data - { currentPassword, newPassword }
     * @returns {Promise} - Respuesta del servidor
     */
    changePassword: async (data) => {
        return await api.post('/auth/change-password', data);
    },

    /**
     * Cerrar sesión
     * @returns {Promise} - Respuesta del servidor
     */
    logout: async () => {
        return await api.post('/auth/logout');
    },
};

export default authService;
