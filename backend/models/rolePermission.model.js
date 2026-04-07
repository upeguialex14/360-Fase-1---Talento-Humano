const pool = require('../config/db');

class RolePermission {
    static async assignPermissionToRole(roleCode, permissionCode) {
        try {
            await pool.execute(
                'INSERT INTO role_permissions (role_code, permission_code) VALUES (?, ?) ON DUPLICATE KEY UPDATE permission_code = permission_code',
                [roleCode, permissionCode]
            );
            return { success: true };
        } catch (err) {
            console.error('[RolePermission] Error assigning permission:', err);
            throw err;
        }
    }

    static async removePermissionFromRole(roleCode, permissionCode) {
        try {
            await pool.execute(
                'DELETE FROM role_permissions WHERE role_code = ? AND permission_code = ?',
                [roleCode, permissionCode]
            );
            return { success: true };
        } catch (err) {
            console.error('[RolePermission] Error removing permission:', err);
            throw err;
        }
    }

    static async getPermissionsByRole(roleCode) {
        try {
            const [rows] = await pool.execute(
                'SELECT p.* FROM permissions p JOIN role_permissions rp ON p.permission_code = rp.permission_code WHERE rp.role_code = ?',
                [roleCode]
            );
            return rows;
        } catch (err) {
            console.error('[RolePermission] Error getting permissions by role:', err);
            return [];
        }
    }

    static async getAllRolePermissions() {
        try {
            const [rows] = await pool.execute(
                'SELECT rp.*, r.role_name, p.permission_name FROM role_permissions rp JOIN roles r ON rp.role_code = r.role_code JOIN permissions p ON rp.permission_code = p.permission_code'
            );
            return rows;
        } catch (err) {
            console.error('[RolePermission] Error getting all role permissions:', err);
            return [];
        }
    }

    static async getById(rolePermissionId) {
        try {
            const [rows] = await pool.execute(
                'SELECT role_code, permission_code FROM role_permissions WHERE role_permission_id = ?',
                [rolePermissionId]
            );
            return rows[0] || null;
        } catch (err) {
            console.error('[RolePermission] Error getting role permission by id:', err);
            return null;
        }
    }

    static async checkPermission(roleCode, permissionName) {
        try {
            const [permissions] = await pool.execute(
                'SELECT p.permission_name FROM permissions p JOIN role_permissions rp ON p.permission_code = rp.permission_code WHERE rp.role_code = ? AND p.permission_name = ?',
                [roleCode, permissionName]
            );
            return permissions.length > 0;
        } catch (err) {
            console.error('[RolePermission] Error checking permission:', err);
            return false;
        }
    }

    static async checkPageAccess(roleCode, pageCode, accessType = 'can_view') {
        try {
            const [access] = await pool.execute(
                `SELECT ${accessType} FROM role_pages WHERE role_code = ? AND page_code = ?`,
                [roleCode, pageCode]
            );
            return access.length > 0 && access[0][accessType] === 1;
        } catch (err) {
            console.error('[RolePermission] Error checking page access:', err);
            return false;
        }
    }
}

module.exports = RolePermission;
