const pool = require('../config/db');
const PermissionService = require('../services/permission.service');

/**
 * Middleware para verificar si el usuario tiene un permiso específico.
 * @param {string} requiredPermission - El nombre del permiso requerido.
 */
const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        const { role_id } = req.user;

        if (!role_id) {
            return res.status(403).json({ success: false, message: 'No se encontró el rol del usuario' });
        }

        try {
            // Gerente (1) y Tecnologia (2) tienen acceso total
            if (role_id === 1 || role_id === 2) {
                return next();
            }

            // Consultar si el rol tiene el permiso solicitado
            const hasPermission = await PermissionService.checkPermission(role_id, requiredPermission);

            if (hasPermission) {
                return next();
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
        const { role_id } = req.user;

        if (!role_id) {
            return res.status(403).json({ success: false, message: 'No se encontró el rol del usuario' });
        }

        try {
            // Gerente (1) y Tecnologia (2) tienen acceso total
            if (role_id === 1 || role_id === 2) {
                return next();
            }

            // Líderes (3) y Soporte (4) tienen acceso a gestión de equipo
            if ((role_id === 3 || role_id === 4) && ['USUARIOS', 'ROLES', 'PERMISSIONS'].includes(pageCode)) {
                return next();
            }

            // Analista (5) solo tiene acceso de consulta básica
            if (role_id === 5 && accessType === 'can_view' && ['DASHBOARD', 'REPORTES'].includes(pageCode)) {
                return next();
            }

            // Consultar si el rol tiene el acceso solicitado para la página
            const hasAccess = await PermissionService.checkPageAccess(role_id, pageCode, accessType);

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
