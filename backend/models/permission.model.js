/**
 * Modelo de Permiso
 * Encapsulates all permission-related database queries
 */
const pool = require('../config/db');

const Permission = {
    async getAll() {
        const [rows] = await pool.execute('SELECT * FROM permissions');
        return rows;
    },

    async getByCode(permissionCode) {
        const [rows] = await pool.execute(
            'SELECT * FROM permissions WHERE permission_code = ?',
            [permissionCode]
        );
        return rows[0] || null;
    },

    async getById(permissionId) {
        const [rows] = await pool.execute(
            'SELECT * FROM permissions WHERE permission_id = ?',
            [permissionId]
        );
        return rows[0] || null;
    },

    async create(permissionData) {
        const { permission_code, permission_name, module_name, description } = permissionData;
        const [result] = await pool.execute(
            'INSERT INTO permissions (permission_code, permission_name, module_name, description) VALUES (?, ?, ?, ?)',
            [permission_code, permission_name, module_name, description]
        );
        return result.insertId;
    }
};

module.exports = Permission;
