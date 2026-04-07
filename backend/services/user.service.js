/**
 * User Service
 * Manages user-related business logic (CRUD, blocking, etc.)
 */
const pool = require('../config/db');
const User = require('../models/user.model');
const LoginLog = require('../models/loginLog.model');
const HistoricalLogin = require('../models/historicalLogin.model');
const UserLockHistory = require('../models/userLockHistory.model');
const bcrypt = require('bcrypt');
const { validatePassword } = require('../validators/password.validator');

class UserService {
    async getAllUsers() {
        try {
            return await User.getAll();
        } catch (err) {
            console.error('[UserService] Error getting all users:', err);
            throw err;
        }
    }

    async getUserById(userId) {
        try {
            return await User.findById(userId);
        } catch (err) {
            console.error('[UserService] Error getting user by ID:', err);
            throw err;
        }
    }

    async createUser(userData) {
        try {
            // Validate password
            const validation = validatePassword(userData.password);
            if (!validation.valid) {
                throw new Error(validation.message);
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(userData.password, salt);

            // Insert user
            const userId = await User.create({
                login: userData.login,
                password_hash: passwordHash,
                email: userData.email,
                full_name: userData.full_name,
                role_code: userData.role_code
            });

            return { insertId: userId };
        } catch (err) {
            console.error('[UserService] Error creating user:', err);
            throw err;
        }
    }

    async updateUser(userId, userData) {
        try {
            return await User.update(userId, userData);
        } catch (err) {
            console.error('[UserService] Error updating user:', err);
            throw err;
        }
    }

    async blockUser(userId, reason = 'Manual block by admin') {
        try {
            await User.lockAccount(userId);
            // Log in user_lock_history
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            await UserLockHistory.logLock(userId, user.login, user.email);
            return { success: true, message: 'Usuario bloqueado' };
        } catch (err) {
            console.error('[UserService] Error blocking user:', err);
            throw err;
        }
    }

    async unblockUser(userId) {
        try {
            await User.unlockAccount(userId);
            // Update user_lock_history
            await UserLockHistory.logUnlock(userId);
            return { success: true, message: 'Usuario desbloqueado' };
        } catch (err) {
            console.error('[UserService] Error unblocking user:', err);
            throw err;
        }
    }

    async getBlockedUsers() {
        try {
            return await User.getBlockedUsers();
        } catch (err) {
            console.error('[UserService] Error getting blocked users:', err);
            throw err;
        }
    }

    async forcePasswordChange(userId) {
        try {
            await User.forcePasswordChange(userId);
            return { success: true };
        } catch (err) {
            console.error('[UserService] Error forcing password change:', err);
            throw err;
        }
    }
}

module.exports = new UserService();
