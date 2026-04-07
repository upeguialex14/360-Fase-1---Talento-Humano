/**
 * Auth Controller
 * Handles HTTP requests for authentication
 * All business logic delegated to AuthService
 */
const authService = require('../services/auth.service');

const login = async (req, res) => {
    try {
        const { login: username, password } = req.body;
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        console.log(`[AuthController] Login request for: ${username}`);

        const result = await authService.login(username, password, ip, userAgent);

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            token: result.token,
            user: result.user,
            forceChangePassword: result.forceChangePassword
        });
    } catch (error) {
        console.error('[AuthController] Login error:', error);
        const statusCode = error.message.includes('bloqueado') ? 403 : 401;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error en autenticación'
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Nueva contraseña es obligatoria'
            });
        }

        await authService.changePassword(userId, newPassword);

        res.json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });
    } catch (error) {
        console.error('[AuthController] Change password error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al cambiar contraseña'
        });
    }
};

const logout = async (req, res) => {
    try {
        const { user_id } = req.user;
        await authService.logout(user_id);
        res.json({
            success: true,
            message: 'Logout exitoso'
        });
    } catch (error) {
        console.error('[AuthController] Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error internal during logout'
        });
    }
};

const getLastSession = async (req, res) => {
    try {
        const { user_id } = req.user;
        const lastLogin = await authService.getLastSession(user_id);
        res.json({
            success: true,
            last_login: lastLogin
        });
    } catch (error) {
        console.error('[AuthController] Get last session error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener última sesión'
        });
    }
};

const forcePasswordChangeDemo = async (req, res) => {
    try {
        const { user_id, role_code } = req.user;

        if (role_code !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requiere rol ADMIN.'
            });
        }

        await authService.forcePasswordChange(user_id, user_id, role_code);

        res.json({
            success: true,
            message: 'Contraseña expirada manualmente para demostración'
        });
    } catch (error) {
        console.error('[AuthController] Force password change error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al forzar cambio de contraseña'
        });
    }
};

module.exports = { login, changePassword, logout, getLastSession, forcePasswordChangeDemo };
