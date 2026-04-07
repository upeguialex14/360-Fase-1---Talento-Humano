/**
 * Admin Controller
 * Handles HTTP requests for admin-only operations
 * All business logic delegated to services
 */
const userService = require('../services/user.service');
const loggingService = require('../services/logging.service');

/**
 * Get all locked users - ADMIN only
 */
const getBlockedUsers = async (req, res) => {
    try {
        const { role_code } = req.user;

        if (role_code !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requiere rol ADMIN.'
            });
        }

        const blockedUsers = await userService.getBlockedUsers();
        res.json({ success: true, data: blockedUsers });
    } catch (error) {
        console.error('[AdminController] Get blocked users error:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/**
 * Unlock user - ADMIN only
 */
const unlockUser = async (req, res) => {
    try {
        const { role_code } = req.user;
        const { id: userId } = req.params;

        if (role_code !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requiere rol ADMIN.'
            });
        }

        await userService.unblockUser(userId);
        res.json({ success: true, message: 'Usuario desbloqueado correctamente' });
    } catch (error) {
        console.error('[AdminController] Unlock user error:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/**
 * Get user activity history - ADMIN only
 */
const getUserActivity = async (req, res) => {
    try {
        const { role_code } = req.user;

        if (role_code !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requiere rol ADMIN.'
            });
        }

        const activities = await loggingService.getAllUserActivity();
        res.json({ success: true, data: activities });
    } catch (error) {
        console.error('[AdminController] Get user activity error:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

/**
 * Block user manually - ADMIN only
 */
const blockUser = async (req, res) => {
    try {
        const { role_code } = req.user;
        const { id: userId } = req.params;
        const { reason } = req.body;

        if (role_code !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requiere rol ADMIN.'
            });
        }

        await userService.blockUser(userId, reason);
        res.json({ success: true, message: 'Usuario bloqueado correctamente' });
    } catch (error) {
        console.error('[AdminController] Block user error:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

module.exports = { getBlockedUsers, unlockUser, getUserActivity, blockUser };