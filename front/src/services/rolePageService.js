import api from './api';

/**
 * Servicio para la gestión de accesos a páginas por rol
 */
export const rolePageService = {
    /**
     * Obtiene todas las páginas con su estado de acceso para un rol determinado
     * @param {string} roleCode - Código del rol
     * @returns {Promise} - { success, data }
     */
    getRolePages: async (roleCode) => {
        return await api.get(`/role-mgmt/roles/${roleCode}/pages`);
    },

    /**
     * Actualiza los accesos de páginas para un rol
     * @param {string} roleCode - Código del rol
     * @param {Array} pages - Array de { page_code, can_view, can_edit }
     * @returns {Promise} - { success, message }
     */
    updateRolePages: async (roleCode, pages) => {
        return await api.put(`/role-mgmt/roles/${roleCode}/pages`, { pages });
    }
};

export default rolePageService;
