const pool = require('../config/db');

const PendingAccess = {
    async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM pending_access_requests WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    },

    async create(data) {
        const { email, name, picture_url } = data;
        const [result] = await pool.execute(
            'INSERT INTO pending_access_requests (email, name, picture_url, status) VALUES (?, ?, ?, "pending") ON DUPLICATE KEY UPDATE name = VALUES(name), picture_url = VALUES(picture_url), status = "pending"',
            [email, name, picture_url]
        );
        return result.insertId;
    },

    async getAllPending() {
        const [rows] = await pool.execute(
            'SELECT * FROM pending_access_requests WHERE status = "pending" ORDER BY created_at DESC'
        );
        return rows;
    },

    async updateStatus(id, status, roleId, reviewedBy) {
        await pool.execute(
            'UPDATE pending_access_requests SET status = ?, role_id = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
            [status, roleId, reviewedBy, id]
        );
    },

    async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM pending_access_requests WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }
};

module.exports = PendingAccess;
