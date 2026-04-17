/**
 * Permission Service
 * Handles permission checking logic
 * NO DATABASE QUERIES - ALL DB ACCESS THROUGH MODELS
 */
const RolePermission = require('../models/rolePermission.model');

class PermissionService {
    static async checkPermission(roleId, requiredPermission) {
        try {
            return await RolePermission.checkPermission(roleId, requiredPermission);
        } catch (err) {
            console.error('[PermissionService] Error checking permission:', err);
            return false;
        }
    }

    static async checkPageAccess(roleId, pageCode, accessType = 'can_view') {
        try {
            return await RolePermission.checkPageAccess(roleId, pageCode, accessType);
        } catch (err) {
            console.error('[PermissionService] Error checking page access:', err);
            return false;
        }
    }
}

module.exports = PermissionService;