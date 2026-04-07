/**
 * Permission Service
 * Handles permission checking logic
 * NO DATABASE QUERIES - ALL DB ACCESS THROUGH MODELS
 */
const RolePermission = require('../models/rolePermission.model');

class PermissionService {
    static async checkPermission(roleCode, requiredPermission) {
        try {
            return await RolePermission.checkPermission(roleCode, requiredPermission);
        } catch (err) {
            console.error('[PermissionService] Error checking permission:', err);
            return false;
        }
    }

    static async checkPageAccess(roleCode, pageCode, accessType = 'can_view') {
        try {
            return await RolePermission.checkPageAccess(roleCode, pageCode, accessType);
        } catch (err) {
            console.error('[PermissionService] Error checking page access:', err);
            return false;
        }
    }
}

module.exports = PermissionService;