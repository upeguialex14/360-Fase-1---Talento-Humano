/**
 * Auth Service
 * Encapsulates authentication and security logic (login, password changes, user blocking)
 * Uses User Model for database queries
 * NO DATABASE QUERIES - ALL DB ACCESS THROUGH MODELS
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Parameter = require('../models/parameter.model');
const HistoricalLogin = require('../models/historicalLogin.model');
const RolePermission = require('../models/rolePermission.model');
const Page = require('../models/page.model');
const LoggingService = require('./logging.service');
const { validatePassword } = require('../validators/password.validator');

class AuthService {
    async login(username, password, ip, userAgent) {
        // Validate inputs
        if (!username || !password) {
            throw new Error('Usuario y contraseña son obligatorios');
        }

        // Find user by login
        const user = await User.findByLogin(username);
        if (!user) {
            await LoggingService.logLogin(false, null, username, 'USER_NOT_FOUND', ip, userAgent);
            throw new Error('Usuario o contraseña incorrecta');
        }

        // Check if locked
        if (user.is_locked) {
            await LoggingService.logLogin(false, user.user_id, username, 'USER_LOCKED', ip, userAgent);
            throw new Error('Usuario bloqueado, contacta a tu jefe de área.');
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            await this.handleFailedAttempt(user, username, ip, userAgent);
            throw new Error('Usuario o contraseña incorrecta');
        }

        // Success: Reset login attempts and update last login
        await User.resetLoginData(user.user_id);
        await LoggingService.logLogin(true, user.user_id, username, null, ip, userAgent);

        // Insert into historial_login
        await this.logHistoricalLogin(user, ip, userAgent);

        // Get user role
        const roleName = await Role.getRoleName(user.role_code);
        user.role_name = roleName;

        // Check if password change is required
        const forceChange = this.needsPasswordChange(user);

        // Get permissions and pages
        const permissions = await this.getUserPermissions(user.role_code);
        const pages = await this.getUserPages(user.role_code);

        // Generate JWT
        const token = jwt.sign(
            { user_id: user.user_id, role_code: user.role_code, login: user.login },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            token,
            user: {
                user_id: user.user_id,
                login: user.login,
                email: user.email,
                full_name: user.full_name,
                role_code: user.role_code,
                role_name: user.role_name,
                permissions,
                pages
            },
            forceChangePassword: forceChange
        };
    }

    async handleFailedAttempt(user, username, ip, userAgent) {
        const newAttempts = (user.failed_attempts || 0) + 1;
        const maxAttempts = await Parameter.getByKey('max_login_attempts') || 5;
        const isLocked = newAttempts >= maxAttempts ? 1 : 0;

        await User.updateFailedAttempts(user.user_id, newAttempts, isLocked);

        if (isLocked) {
            await LoggingService.logLockHistory(user.user_id, user.login, user.email, newAttempts);
        }

        await LoggingService.logLogin(false, user.user_id, username, 'WRONG_PASSWORD', ip, userAgent);
    }

    async logHistoricalLogin(user, ip, userAgent) {
        try {
            await HistoricalLogin.logHistoricalLogin(user.user_id, user.login, user.email, ip, userAgent);
        } catch (err) {
            console.error('[AuthService] Error logging historical login:', err);
            // Don't throw - don't block login due to audit error
        }
    }

    async getUserPermissions(roleCode) {
        try {
            const permissions = await RolePermission.getPermissionsByRole(roleCode);
            return permissions.map(p => ({ permission_name: p.permission_name, module_name: p.module_name })) || [];
        } catch (err) {
            console.error('[AuthService] Error getting permissions:', err);
            return [];
        }
    }

    async getUserPages(roleCode) {
        try {
            const pageRows = await Page.getPagesForRole(roleCode);

            // Normalize and filter duplicates
            const seen = new Set();
            return pageRows.filter(p => {
                if (p.page_code === 'USERS') {
                    p.page_code = 'USUARIOS';
                    p.page_name = 'Gestión de Usuarios';
                    p.route = '/usuarios';
                }
                if (seen.has(p.page_code)) return false;
                seen.add(p.page_code);
                return true;
            });
        } catch (err) {
            console.error('[AuthService] Error getting pages:', err);
            return [];
        }
    }

    needsPasswordChange(user) {
        if (user.change_password_required === 1) return true;
        if (!user.password_changed_at) return true;
        const now = new Date();
        const expiresAt = new Date(user.password_expires_at);
        return now > expiresAt;
    }

    async changePassword(userId, newPassword) {
        // Validate password
        const validation = validatePassword(newPassword);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        // Get password expiry days
        const diasMax = await Parameter.getByKey('dias_cambio_pwd') || 30;

        // Calculate expiry date
        const expiresAt = new Date(Date.now() + diasMax * 24 * 60 * 60 * 1000);

        // Update user password
        await User.updatePassword(userId, hash, expiresAt);
    }

    async logout(userId) {
        try {
            await HistoricalLogin.logout(userId);
        } catch (err) {
            console.error('[AuthService] Error on logout:', err);
            // Don't throw - logout is not critical
        }
    }

    async getLastSession(userId) {
        try {
            const lastSessionDate = await HistoricalLogin.getLastSession(userId);
            return lastSessionDate;
        } catch (err) {
            console.error('[AuthService] Error getting last session:', err);
            return null;
        }
    }

    async forcePasswordChange(userId, adminId, role) {
        if (role !== 'ADMIN') {
            throw new Error('Acceso denegado. Se requiere rol ADMIN.');
        }

        const diasMax = await Parameter.getByKey('dias_cambio_pwd') || 30;

        await User.forcePasswordExpiry(userId, diasMax);
    }
}

module.exports = new AuthService();
