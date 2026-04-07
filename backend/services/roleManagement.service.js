const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const RolePermission = require('../models/rolePermission.model');
const HistorialPermisosRoles = require('../models/historialPermisosRoles.model');

/**
 * Role Management Service
 * Handles business logic for role and permission management
 * NO DATABASE QUERIES - ALL DB ACCESS THROUGH MODELS
 */
class RoleManagementService {
    async getAllRoles() {
        return await Role.getAll();
    }

    async createRole(roleData) {
        const { role_code, role_name, description } = roleData;
        return await Role.create({ role_code, role_name, description });
    }

    async getAllPermissions() {
        return await Permission.getAll();
    }

    async createPermission(permissionData) {
        const { permission_code, permission_name, module_name, description } = permissionData;
        return await Permission.create({ permission_code, permission_name, module_name, description });
    }

    async getAllRolePermissions() {
        return await RolePermission.getAllRolePermissions();
    }

    async assignPermissionToRole(roleCode, permissionCode, user) {
        await RolePermission.assignPermissionToRole(roleCode, permissionCode);

        // Audit log
        try {
            await this.logPermissionAction(roleCode, permissionCode, 'otorgado', user);
        } catch (auditErr) {
            console.error('[AUDIT] Error logging permission assignment:', auditErr);
        }

        return { success: true, message: 'Permiso asignado exitosamente' };
    }

    async revokePermissionFromRole(rolePermissionId, user) {
        // Get info before deleting
        const assignment = await RolePermission.getById(rolePermissionId);
        if (!assignment) {
            throw new Error('Asignación no encontrada');
        }

        await RolePermission.removePermissionFromRole(assignment.role_code, assignment.permission_code);

        // Audit log
        try {
            await this.logPermissionAction(assignment.role_code, assignment.permission_code, 'revocado', user);
        } catch (auditErr) {
            console.error('[AUDIT] Error logging permission revocation:', auditErr);
        }

        return { success: true, message: 'Permiso revocado exitosamente' };
    }

    async logPermissionAction(roleCode, permissionCode, action, user) {
        try {
            const roleInfo = await Role.getRoleAndId(roleCode);
            const permission = await Permission.getByCode(permissionCode);

            const rolId = roleInfo?.role_id || null;
            const rolName = roleInfo?.role_name || roleCode;
            const permissionName = permission?.permission_name || permissionCode;

            await HistorialPermisosRoles.logAction(rolId, rolName, permissionName, action, user.user_id, user.login);
        } catch (err) {
            console.error('[RoleManagementService] Error logging permission action:', err);
            throw err;
        }
    }
}

module.exports = new RoleManagementService();