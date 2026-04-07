/**
 * Modelo de Rol
 * Encapsulates all role-related database queries
 */
const pool = require('../config/db');

const Role = {
    async getRoleByCode(roleCode) {
        const [rows] = await pool.execute(
            'SELECT * FROM roles WHERE role_code = ?',
            [roleCode]
        );
        return rows[0] || null;
    },

    async getAll() {
        const [rows] = await pool.execute('SELECT * FROM roles');
        return rows;
    },

    async getPermissionsByRole(roleCode) {
        const [rows] = await pool.execute(
            `SELECT p.* FROM permissions p 
             JOIN role_permissions rp ON p.permission_id = rp.permission_id 
             WHERE rp.role_code = ?`,
            [roleCode]
        );
        return rows;
    },

    async create(roleData) {
        const { role_code, role_name, description } = roleData;
        const [result] = await pool.execute(
            'INSERT INTO roles (role_code, role_name, description) VALUES (?, ?, ?)',
            [role_code, role_name, description]
        );
        return result.insertId;
    },

    async update(roleCode, roleData) {
        const { role_name, description } = roleData;
        await pool.execute(
            'UPDATE roles SET role_name = ?, description = ? WHERE role_code = ?',
            [role_name, description, roleCode]
        );
        return { success: true };
    },

    async getRoleName(roleCode) {
        try {
            const [rows] = await pool.execute(
                'SELECT role_name FROM roles WHERE role_code = ?',
                [roleCode]
            );
            return rows.length > 0 ? rows[0].role_name : 'Sin Rol';
        } catch (err) {
            console.error('[Role] Error getting role name:', err);
            return 'Sin Rol';
        }
    },

    async getRoleAndId(roleCode) {
        try {
            const [rows] = await pool.execute(
                'SELECT role_id, role_name FROM roles WHERE role_code = ?',
                [roleCode]
            );
            return rows[0] || null;
        } catch (err) {
            console.error('[Role] Error getting role and id:', err);
            return null;
        }
    }
};

module.exports = Role;
