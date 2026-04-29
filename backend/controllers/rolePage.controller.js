const rolePageService = require('../services/rolePage.service');

/**
 * Obtiene todas las páginas con los permisos asignados a un rol específico.
 * Realiza un LEFT JOIN para asegurar que todas las páginas se muestren,
 * incluso si el rol aún no tiene permisos asignados.
 */
const getRolePages = async (req, res) => {
    try {
        const { role_id } = req.params;
        const data = await rolePageService.getRolePages(role_id);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error al obtener páginas por rol:', error);
        if (error.message.includes('no existe')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/**
 * Actualiza los permisos de las páginas para un rol.
 * Implementa UPSERT usando ON DUPLICATE KEY UPDATE.
 */
const updateRolePages = async (req, res) => {
    try {
        const { role_id } = req.params;
        const { pages } = req.body; // Array de { page_code, can_view, can_edit }

        if (!Array.isArray(pages)) {
            return res.status(400).json({ success: false, message: 'El cuerpo de la petición debe contener un array de páginas' });
        }

        const result = await rolePageService.updateRolePages(role_id, pages, req.user);
        res.json(result);
    } catch (error) {
        console.error('Error al actualizar páginas por rol:', error);

        // Manejo de errores específicos
        if (error.message.includes('no existe')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({
                success: false,
                message: 'Error de integridad: El rol o la página no existen.'
            });
        }

        res.status(500).json({ success: false, message: 'Error interno al actualizar permisos' });
    }
};

module.exports = {
    getRolePages,
    updateRolePages
};
