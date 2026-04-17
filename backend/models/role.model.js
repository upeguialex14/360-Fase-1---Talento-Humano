/**
 * Modelo de Rol
 * Encapsulates all role-related database queries
 */
const pool = require('../config/db');

const Role = {
    async getRoleById(roleId) {
        const [rows] = await pool.execute(
            'SELECT * FROM roles WHERE role_id = ?',
            [roleId]
        );
        return rows[0] || null;
    },

    async getAll() {
        const [rows] = await pool.execute('SELECT * FROM roles');
        return rows;
    },

    async getPermissionsByRole(roleId) {
        const [rows] = await pool.execute(
            `SELECT p.* FROM permissions p 
             JOIN role_permissions rp ON p.permission_id = rp.permission_id 
             WHERE rp.role_id = ?`,
            [roleId]
        );
        return rows;
    },

    async create(roleData) {
        const { role_name, description } = roleData;
        const [result] = await pool.execute(
            'INSERT INTO roles (role_name, description) VALUES (?, ?)',
            [role_name, description]
        );
        return result.insertId;
    },

    async update(roleId, roleData) {
        const { role_name, description } = roleData;
        await pool.execute(
            'UPDATE roles SET role_name = ?, description = ? WHERE role_id = ?',
            [role_name, description, roleId]
        );
        return { success: true };
    },

    async getRoleName(roleId) {
        try {
            const [rows] = await pool.execute(
                'SELECT name_role FROM roles WHERE role_id = ?',
                [roleId]
            );
            return rows.length > 0 ? rows[0].name_role : 'Sin Rol';
        } catch (err) {
            console.error('[Role] Error getting role name:', err);
            return 'Sin Rol';
        }
    },

    async getRoleAndId(roleId) {
        try {
            const [rows] = await pool.execute(
                'SELECT role_id, name_role FROM roles WHERE role_id = ?',
                [roleId]
            );
            return rows[0] || null;
        } catch (err) {
            console.error('[Role] Error getting role and id:', err);
            return null;
        }
    }
};

module.exports = Role;
