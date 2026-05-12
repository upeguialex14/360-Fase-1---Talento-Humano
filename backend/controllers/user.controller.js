/**
 * User Controller
 * Handles HTTP requests for user management
 * All business logic delegated to UserService
 */
const userService = require('../services/user.service');
const authService = require('../services/auth.service');
const revalService = require('../services/reval.service');

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

const createUser = async (req, res) => {
    try {
        console.log('🔥 CONTROLADOR CORRECTO EJECUTADO');
        
        // 1. Extraer los campos REALES del frontend
        const { correo_corp, usuario_ad, ou_path, groups } = req.body;

        // 2. Guardar usuario en la base de datos local
        const localData = {
            ...req.body,
            login: usuario_ad,
            email: correo_corp,
            password: 'Temp123!'
        };
        
        const localResult = await userService.createUser(localData);

        // 3. Construcción del objeto para REVAL
        const revalUserData = {
            username: usuario_ad,
            firstname: usuario_ad || 'Usuario',
            lastname: 'AD',
            password: 'Temp123!',
            ou_path: ou_path || 'OU=Usuarios,OU=Sac,DC=reval,DC=local',
            groups: groups || ['SG_PTR_PLUS_PRODUCCION']
        };

        console.log('📤 Datos enviados a REVAL:', revalUserData);

        // 4. Consumir API externa
        let revalResult;
        try {
            console.log('🚀 Llamando a REVAL');
            revalResult = await revalService.createRevalUser(revalUserData);
        } catch (err) {
            console.error('[REVAL] Error en integración:', err.message);
            revalResult = { success: false, error: err.message };
        }

        res.status(201).json({
            success: true,
            local: localResult,
            reval: revalResult
        });

    } catch (error) {
        console.error('[UserController] Create user error:', error);
        res.status(500).json({ success: false, message: error.message || 'Error al crear usuario' });
    }
};

module.exports = { getUsers, getUser, updateUserPassword, updateUser, createUser };
