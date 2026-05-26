/**
 * Auth Service
 * Encapsulates authentication and security logic (login, password changes, user blocking)
 * Uses User Model for database queries
 * NO DATABASE QUERIES - ALL DB ACCESS THROUGH MODELS
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Parameter = require('../models/parameter.model');
const HistoricalLogin = require('../models/historicalLogin.model');
const RolePermission = require('../models/rolePermission.model');
const Page = require('../models/page.model');
const LoggingService = require('./logging.service');
const { validatePassword } = require('../validators/password.validator');

const ALLOWED_DOMAINS = ['multipagas.com', 'reval.com.co', 'multival.com.co'];
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    async googleLogin(idToken, ip, userAgent) {
        // 1. Verificar el token con Google
        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (err) {
            throw new Error('Token de Google inválido o expirado');
        }

        const { email, given_name, family_name } = payload;

        // 2. Validar dominio empresarial
        const domain = email.split('@')[1];
        if (!ALLOWED_DOMAINS.includes(domain)) {
            throw new Error(
                `Acceso denegado. Solo se permite el ingreso con dominios empresariales (@multipagas.com, @reval.com.co, @multival.com.co)`
            );
        }

        // 3. Buscar usuario en la base de datos por email
        const user = await User.findByEmail(email);
        if (!user) {
            const PendingAccess = require('../models/pendingAccess.model');
            const pendingRequest = await PendingAccess.findByEmail(email);
            
            if (pendingRequest) {
                 if (pendingRequest.status === 'pending') {
                      throw new Error('PENDING_APPROVAL:Tu solicitud de acceso está pendiente de aprobación por un gerente.');
                 } else if (pendingRequest.status === 'rejected') {
                      throw new Error('Tu solicitud de acceso fue rechazada.');
                 }
            }

            // Create pending request
            await PendingAccess.create({ email, name: `${given_name || ''} ${family_name || ''}`.trim(), picture_url: payload.picture });
            
            // Emit socket event to gerentes
            try {
                const chatSocket = require('../sockets/chat.socket');
                const io = chatSocket.getIO ? chatSocket.getIO() : null;
                if (io) {
                    io.to('GERENTE').emit('newPendingUser', { email, name: `${given_name || ''} ${family_name || ''}`.trim() });
                }
            } catch (e) {
                console.error('Error emitting newPendingUser socket event:', e);
            }

            await LoggingService.logLogin(false, null, email, 'USER_PENDING', ip, userAgent);
            throw new Error('PENDING_APPROVAL:Tu solicitud fue enviada al gerente. Espera su aprobación para poder ingresar.');
        }

        // 4. Verificar que el usuario esté activo
        if (user.status_id === 0) {
            await LoggingService.logLogin(false, user.user_id, email, 'USER_LOCKED', ip, userAgent);
            throw new Error('Tu cuenta está bloqueada. Contacta a tu jefe de área.');
        }

        // 5. Login exitoso - actualizar datos de sesión
        await User.resetLoginData(user.user_id);
        await LoggingService.logLogin(true, user.user_id, email, null, ip, userAgent);
        await this.logHistoricalLogin(user, ip, userAgent);

        // 6. Obtener rol, permisos y páginas
        const roleName = await Role.getRoleName(user.role_id);
        user.role_name = roleName;
        const permissions = await this.getUserPermissions(user.role_id);
        const pages = await this.getUserPages(user.role_id, user.user_id);

        // 7. Generar JWT interno del sistema (igual que el login normal)
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
            forceChangePassword: false // Google gestiona la seguridad, no forzamos cambio de contraseña
        };
    }

    async handleFailedAttempt(user, username, ip, userAgent) {
        // Log the failed login attempt
        await LoggingService.logLogin(false, user.user_id, username, 'WRONG_PASSWORD', ip, userAgent);

        // Increment attempts
        let currentAttempts = user.failed_attempts || 0;
        currentAttempts += 1;
        let isLocked = false;

        if (currentAttempts >= 3) {
            isLocked = true;
            // Also log to user_lock_history since it's a security lock
            try {
                const UserLockHistory = require('../models/userLockHistory.model');
                await UserLockHistory.logLock(user.user_id, username, user.email);
            } catch (err) {
                console.error('[AuthService] Error logging lock history:', err);
            }
        }

        await User.updateFailedAttempts(user.user_id, currentAttempts, isLocked);

        if (isLocked) {
            throw new Error('Cuenta bloqueada por múltiples intentos fallidos. Contacte al administrador.');
        }
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
            // Fetch all pages with their access state for this role
            const pageRows = await Page.getRolePages(roleId);

            // Filter only those that the user can at least view
            // Note: For Gerente (roleId 1), we might want to return all by default or manage it in DB
            // The user wants control, so let's use the DB state.
            
            // If it's Gerente, we should probably ensure they see everything or at least manage it via RolePageAccess.
            // But to fix the "Gestión de Permisos" reappearing, we must rely on the DB.
            
            return pageRows
                .filter(p => p.can_view === 1)
                .map(p => ({
                    page_code: p.page_code,
                    page_name: p.page_name,
                    route: p.route,
                    can_view: p.can_view,
                    can_edit: p.can_edit
                }));
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
