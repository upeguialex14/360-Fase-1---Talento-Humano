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
        if (user.status_id === 0) {
            await LoggingService.logLogin(false, user.user_id, username, 'USER_LOCKED', ip, userAgent);
            throw new Error('Usuario bloqueado, contacta a tu jefe de área.');
        }

        //Validamos contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);


        // Y REEMPLÁZALO POR ESTO:
        //const isMatch = (password === "Daniel123456.");

        console.log("HACK ACTIVADO - ¿Coincide texto plano?:", isMatch);
        if (!isMatch) {
            await this.handleFailedAttempt(user, username, ip, userAgent);
            console.log('--- DEBUG LOGIN ---');
            console.log('Password que escribiste:', password);
            console.log('Hash que está en la BD:', user.password_hash);

            const isMatch = await bcrypt.compare(password, user.password_hash);
            console.log('¿Coinciden según Bcrypt?:', isMatch);
            throw new Error('Usuario o contraseña incorrecta');
        }

        // Success: Reset login attempts and update last login
        await User.resetLoginData(user.user_id);
        await LoggingService.logLogin(true, user.user_id, username, null, ip, userAgent);

        // Insert into historial_login
        await this.logHistoricalLogin(user, ip, userAgent);

        // Get user role
        const roleName = await Role.getRoleName(user.role_id);
        user.role_name = roleName;

        // Check if password change is required
        const forceChange = this.needsPasswordChange(user);

        // Get permissions and pages
        const permissions = await this.getUserPermissions(user.role_id);
        const pages = await this.getUserPages(user.role_id, user.user_id);

        // Generate JWT
        const token = jwt.sign(
            { user_id: user.user_id, role_id: user.role_id, document_number: user.document_number },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            token,
            user: {
                user_id: user.user_id,
                document_number: user.document_number,
                email: user.email,
                name: user.name,
                last_name: user.last_name,
                role_id: user.role_id,
                role_name: user.role_name,
                permissions,
                pages
            },
            forceChangePassword: forceChange
        };
    }

    async handleFailedAttempt(user, username, ip, userAgent) {
        // Log the failed login attempt
        await LoggingService.logLogin(false, user.user_id, username, 'WRONG_PASSWORD', ip, userAgent);
    }

    async logHistoricalLogin(user, ip, userAgent) {
        try {
            await HistoricalLogin.logHistoricalLogin(user.user_id, user.document_number, user.email, ip, userAgent);
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

    async getUserPages(roleId, userId) {
        try {
            if (roleId === 1) {
                return [
                    { page_code: 'DASHBOARD', page_name: 'Dashboard', route: '/dashboard', can_view: 1, can_edit: 1 },
                    { page_code: 'ROLES', page_name: 'Gestión de Roles', route: '/roles', can_view: 1, can_edit: 1 },
                    { page_code: 'PERMISSIONS', page_name: 'Gestión de Permisos', route: '/permissions', can_view: 1, can_edit: 1 },
                    { page_code: 'USUARIOS', page_name: 'Gestión de Usuarios', route: '/users', can_view: 1, can_edit: 1 },
                    { page_code: 'PLANTA', page_name: 'Planta Operación', route: '/planta', can_view: 1, can_edit: 1 },
                    { page_code: 'COSTOS', page_name: 'Centro de Costos', route: '/costos', can_view: 1, can_edit: 1 },
                    { page_code: 'CARGA_EXCEL', page_name: 'Carga Excel', route: '/upload', can_view: 1, can_edit: 1 },
                    { page_code: 'ORDEN_CONTRATACION', page_name: 'Orden de Contratación', route: '/contratacion', can_view: 1, can_edit: 1 }
                ];
            }

            const pageRows = await Page.getPagesForRole(roleId);

            const seen = new Set();
            return pageRows.filter(p => {
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
        if (user.requires_password_change === 1) return true;
        if (!user.password_changed_at) return true;
        // Check if password hasn't been changed in 30 days
        const passwordChangedDate = new Date(user.password_changed_at);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return passwordChangedDate < thirtyDaysAgo;
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

    async forcePasswordChange(userId, adminId, roleId) {
        if (roleId !== 1) { // Solo Gerente (role_id: 1) puede forzar cambio de contraseña
            throw new Error('Acceso denegado. Se requiere rol de Gerente.');
        }

        const diasMax = await Parameter.getByKey('dias_cambio_pwd') || 30;

        await User.forcePasswordExpiry(userId, diasMax);
    }
}

module.exports = new AuthService();
