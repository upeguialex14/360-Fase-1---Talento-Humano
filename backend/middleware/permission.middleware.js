const pool = require('../config/db');
const PermissionService = require('../services/permission.service');

/**
 * Middleware para verificar si el usuario tiene un permiso específico.
 * @param {string} requiredPermission - El nombre del permiso requerido.
 */
const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        const { role_code } = req.user;

        if (!role_code) {
            return res.status(403).json({ success: false, message: 'No se encontró el rol del usuario' });
        }

        try {
            // Si es ADMIN, tiene acceso total (opcional, según requerimiento)
            if (role_code === 'LIDER') {
                return next();
            }

            // Consultar si el rol tiene el permiso solicitado
            const hasPermission = await PermissionService.checkPermission(role_code, requiredPermission);

            if (hasPermission) {
            }

            return res.status(403).json({ success: false, message: 'No tiene permisos para realizar esta acción' });
        } catch (error) {
            console.error('Error verificando permisos:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    };
};

/**
 * Middleware para verificar si el usuario tiene acceso a una página específica.
 * @param {string} pageCode - El código de la página requerida.
 * @param {string} accessType - 'can_view' o 'can_edit'.
 */
const checkPageAccess = (pageCode, accessType = 'can_view') => {
    return async (req, res, next) => {
        const { role_code } = req.user;

        if (!role_code) {
            return res.status(403).json({ success: false, message: 'No se encontró el rol del usuario' });
        }

        try {
            // El ADMIN tiene acceso total
            if (role_code === 'ADMIN') {
                return next();
            }

            // Consultar si el rol tiene el acceso solicitado para la página
            const hasAccess = await PermissionService.checkPageAccess(role_code, pageCode, accessType);

            if (hasAccess) {
                return next();
            }

            return res.status(403).json({ success: false, message: 'No tiene permiso para acceder a esta página o realizar esta acción' });
        } catch (error) {
            console.error('Error verificando acceso a página:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    };
};

module.exports = { checkPermission, checkPageAccess };
