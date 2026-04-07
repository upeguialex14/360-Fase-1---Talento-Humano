/**
 * Role Controller
 * Handles HTTP requests for role management
 * All business logic delegated to RoleService
 */
const roleService = require('../services/role.service');

const getRoles = async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();
        res.json({ success: true, data: roles });
    } catch (error) {
        console.error('[RoleController] Get roles error:', error);
        res.status(500).json({ success: false, message: 'Error al obtener roles' });
    }
};

const getUserPermissions = async (req, res) => {
    try {
        const { role_code } = req.user;
        const permissions = await roleService.getRolePermissions(role_code);
        res.json({ success: true, data: permissions });
    } catch (error) {
        console.error('[RoleController] Get permissions error:', error);
        res.status(500).json({ success: false, message: 'Error al obtener permisos' });
    }
};

const createRole = async (req, res) => {
    try {
        const roleData = req.body;
        const result = await roleService.createRole(roleData);
        res.json({ success: true, message: 'Rol creado correctamente', data: result });
    } catch (error) {
        console.error('[RoleController] Create role error:', error);
        res.status(500).json({ success: false, message: 'Error al crear rol' });
    }
};

const updateRole = async (req, res) => {
    try {
        const { roleCode } = req.params;
        const roleData = req.body;
        await roleService.updateRole(roleCode, roleData);
        res.json({ success: true, message: 'Rol actualizado correctamente' });
    } catch (error) {
        console.error('[RoleController] Update role error:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar rol' });
    }
};

module.exports = { getRoles, getUserPermissions, createRole, updateRole };
