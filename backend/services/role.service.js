/**
 * Role Service
 * Manages role and permission-related business logic
 */
const pool = require('../config/db');
const Role = require('../models/role.model');
const RolePermission = require('../models/rolePermission.model');

class RoleService {
    async getAllRoles() {
        try {
            return await Role.getAll();
        } catch (err) {
            console.error('[RoleService] Error getting all roles:', err);
            throw err;
        }
    }

    async getRoleByCode(roleCode) {
        try {
            return await Role.getRoleByCode(roleCode);
        } catch (err) {
            console.error('[RoleService] Error getting role:', err);
            throw err;
        }
    }

    async getRolePermissions(roleCode) {
        try {
            const permissions = await RolePermission.getPermissionsByRole(roleCode);
            return permissions.map(p => ({
                permission_id: p.permission_id,
                permission_code: p.permission_code,
                permission_name: p.permission_name
            }));
        } catch (err) {
            console.error('[RoleService] Error getting role permissions:', err);
            throw err;
        }
    }

    async createRole(roleData) {
        try {
            const roleId = await Role.create(roleData);
            return { insertId: roleId };
        } catch (err) {
            console.error('[RoleService] Error creating role:', err);
            throw err;
        }
    }

    async updateRole(roleCode, roleData) {
        try {
            return await Role.update(roleCode, roleData);
        } catch (err) {
            console.error('[RoleService] Error updating role:', err);
            throw err;
        }
    }

    async assignPermissionToRole(roleCode, permissionCode) {
        try {
            return await RolePermission.assignPermissionToRole(roleCode, permissionCode);
        } catch (err) {
            console.error('[RoleService] Error assigning permission:', err);
            throw err;
        }
    }

    async removePermissionFromRole(roleCode, permissionCode) {
        try {
            return await RolePermission.removePermissionFromRole(roleCode, permissionCode);
        } catch (err) {
            console.error('[RoleService] Error removing permission:', err);
            throw err;
        }
    }
}

module.exports = new RoleService();
