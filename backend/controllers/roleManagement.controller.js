const roleManagementService = require('../services/roleManagement.service');

// --- ROLES ---
const getRoles = async (req, res) => {
    try {
        const roles = await roleManagementService.getAllRoles();
        res.json({ success: true, data: roles });
    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({ success: false, message: 'Error al obtener roles' });
    }
};

const createRole = async (req, res) => {
    try {
        const { role_code, role_name, description } = req.body;
        await roleManagementService.createRole({ role_code, role_name, description });
        res.json({ success: true, message: 'Rol creado exitosamente' });
    } catch (error) {
        console.error('Error al crear rol:', error);
        res.status(500).json({ success: false, message: 'Error al crear rol' });
    }
};

// --- PERMISSIONS ---
const getPermissions = async (req, res) => {
    try {
        const permissions = await roleManagementService.getAllPermissions();
        res.json({ success: true, data: permissions });
    } catch (error) {
        console.error('Error al obtener permisos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener permisos' });
    }
};

const createPermission = async (req, res) => {
    try {
        const { permission_code, permission_name, module_name, description } = req.body;
        await roleManagementService.createPermission({ permission_code, permission_name, module_name, description });
        res.json({ success: true, message: 'Permiso creado exitosamente' });
    } catch (error) {
        console.error('Error al crear permiso:', error);
        res.status(500).json({ success: false, message: 'Error al crear permiso' });
    }
};

// --- ROLE-PERMISSIONS ---
const getRolePermissions = async (req, res) => {
    try {
        const rolePermissions = await roleManagementService.getAllRolePermissions();
        res.json({ success: true, data: rolePermissions });
    } catch (error) {
        console.error('Error al obtener permisos por rol:', error);
        res.status(500).json({ success: false, message: 'Error al obtener asignaciones' });
    }
};

const assignPermissionToRole = async (req, res) => {
    try {
        const { role_code, permission_code } = req.body;
        await roleManagementService.assignPermissionToRole(role_code, permission_code, req.user);
        res.json({ success: true, message: 'Permiso asignado exitosamente' });
    } catch (error) {
        console.error('Error al asignar permiso:', error);
        res.status(500).json({ success: false, message: 'Error al asignar permiso' });
    }
};

const revokePermissionFromRole = async (req, res) => {
    try {
        const { role_permission_id } = req.params;
        await roleManagementService.revokePermissionFromRole(role_permission_id, req.user);
        res.json({ success: true, message: 'Permiso revocado exitosamente' });
    } catch (error) {
        console.error('Error al revocar permiso:', error);
        res.status(500).json({ success: false, message: 'Error al revocar permiso' });
    }
};

module.exports = {
    getRoles, createRole,
    getPermissions, createPermission,
    getRolePermissions, assignPermissionToRole, revokePermissionFromRole
};
