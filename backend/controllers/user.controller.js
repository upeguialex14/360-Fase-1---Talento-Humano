/**
 * User Controller
 * Handles HTTP requests for user management
 * All business logic delegated to UserService
 */
const userService = require('../services/user.service');
const authService = require('../services/auth.service');

const getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('[UserController] Get users error:', error);
        res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
};

const getUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('[UserController] Get user error:', error);
        res.status(500).json({ success: false, message: 'Error al obtener usuario' });
    }
};

const updateUserPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Nueva contraseña es obligatoria'
            });
        }

        await authService.changePassword(userId, newPassword);

        res.json({ success: true, message: 'Contraseña del usuario actualizada correctamente' });
    } catch (error) {
        console.error('[UserController] Update password error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar contraseña'
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const userData = req.body;

        await userService.updateUser(userId, userData);

        res.json({ success: true, message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('[UserController] Update user error:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
    }
};

module.exports = { getUsers, getUser, updateUserPassword, updateUser };
