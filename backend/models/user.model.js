/**
 * Modelo de Usuario
 * Encapsulates all user-related database queries
 */
const pool = require('../config/db');

const User = {
    async findByLogin(documentNumber) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE document_number = ?',
            [documentNumber]
        );
        return rows[0] || null;
    },

    async findById(userId) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE user_id = ?',
            [userId]
        );
        return rows[0] || null;
    },

    async getAll() {
        const [rows] = await pool.execute(
            'SELECT user_id, document_number, email, name, last_name, role_id, status_id, last_login, password_changed_at, created_at FROM users'
        );
        return rows;
    },

    async updateFailedAttempts(userId, attempts, isLocked) {
        // Note: System doesn't track failed_attempts. Implement if needed.
        console.log(`[User.updateFailedAttempts] Attempted attempts=${attempts}, isLocked=${isLocked}`);
    },

    async resetLoginData(userId) {
        await pool.execute(
            'UPDATE users SET last_login = NOW() WHERE user_id = ?',
            [userId]
        );
    },

    async updatePassword(userId, hash, expiresAt) {
        await pool.execute(
            'UPDATE users SET password_hash = ?, password_changed_at = NOW(), requires_password_change = 0 WHERE user_id = ?',
            [hash, userId]
        );
    },

    async lockAccount(userId) {
        // Lock by setting status_id to 0 (inactive)
        await pool.execute(
            'UPDATE users SET status_id = 0 WHERE user_id = ?',
            [userId]
        );
    },

    async unlockAccount(userId) {
        // Unlock by setting status_id to 1 (active)
        await pool.execute(
            'UPDATE users SET status_id = 1 WHERE user_id = ?',
            [userId]
        );
    },

    async create(userData) {
        const { document_number, password_hash, email, name, last_name, role_id } = userData;
        const [result] = await pool.execute(
            'INSERT INTO users (document_number, password_hash, email, name, last_name, role_id, status_id) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [document_number, password_hash, email, name, last_name, role_id]
        );
        return result.insertId;
    },

    async update(userId, updates) {
        const fields = [];
        const values = [];

        if (updates.email) {
            fields.push('email = ?');
            values.push(updates.email);
        }
        if (updates.name) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.last_name) {
            fields.push('last_name = ?');
            values.push(updates.last_name);
        }
        if (updates.role_id) {
            fields.push('role_id = ?');
            values.push(updates.role_id);
        }
        if (updates.status_id !== undefined) {
            fields.push('status_id = ?');
            values.push(updates.status_id);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        values.push(userId);

        const query = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
        await pool.execute(query, values);
        return { success: true };
    },

    async getBlockedUsers() {
        const [rows] = await pool.execute(
            'SELECT user_id, document_number, email, name, last_name, last_login FROM users WHERE status_id = 0'
        );
        return rows;
    },

    async forcePasswordChange(userId) {
        await pool.execute(
            'UPDATE users SET requires_password_change = 1 WHERE user_id = ?',
            [userId]
        );
    },

    async forcePasswordExpiry(userId, diasMax) {
        await pool.execute(
            'UPDATE users SET password_changed_at = DATE_SUB(NOW(), INTERVAL ? DAY), requires_password_change = 1 WHERE user_id = ?',
            [diasMax + 1, userId]
        );
    }
};

module.exports = User;
