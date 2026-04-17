/**
 * Modelo de Usuario
 * Encapsulates all user-related database queries
 */
const pool = require('../config/db');

const User = {
    async findByLogin(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
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
            'SELECT user_id, login, email, full_name, role_code, is_active, last_login, password_changed_at, password_expires_at, created_at FROM users'
        );
        return rows;
    },

    async updateFailedAttempts(userId, attempts, isLocked) {
        await pool.execute(
            'UPDATE users SET failed_attempts = ?, is_locked = ? WHERE user_id = ?',
            [attempts, isLocked, userId]
        );
    },

    async resetLoginData(userId) {
        await pool.execute(
            'UPDATE users SET failed_attempts = 0, is_locked = 0, last_login = NOW() WHERE user_id = ?',
            [userId]
        );
    },

    async updatePassword(userId, hash, expiresAt) {
        await pool.execute(
            'UPDATE users SET password_hash = ?, password_changed_at = NOW(), password_expires_at = ?, change_password_required = 0, failed_attempts = 0, is_locked = 0 WHERE user_id = ?',
            [hash, expiresAt, userId]
        );
    },

    async lockAccount(userId) {
        await pool.execute(
            'UPDATE users SET is_locked = 1 WHERE user_id = ?',
            [userId]
        );
    },

    async unlockAccount(userId) {
        await pool.execute(
            'UPDATE users SET is_locked = 0, failed_attempts = 0 WHERE user_id = ?',
            [userId]
        );
    },

    async create(userData) {
        const { login, password_hash, email, full_name, role_code } = userData;
        const [result] = await pool.execute(
            'INSERT INTO users (login, password_hash, email, full_name, role_code, is_active) VALUES (?, ?, ?, ?, ?, 1)',
            [login, password_hash, email, full_name, role_code]
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
        if (updates.full_name) {
            fields.push('full_name = ?');
            values.push(updates.full_name);
        }
        if (updates.role_code) {
            fields.push('role_code = ?');
            values.push(updates.role_code);
        }
        if (updates.is_active !== undefined) {
            fields.push('is_active = ?');
            values.push(updates.is_active);
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
            'SELECT user_id, login, full_name, failed_attempts, last_login FROM users WHERE is_locked = 1'
        );
        return rows;
    },

    async forcePasswordChange(userId) {
        await pool.execute(
            'UPDATE users SET change_password_required = 1 WHERE user_id = ?',
            [userId]
        );
    },

    async forcePasswordExpiry(userId, diasMax) {
        await pool.execute(
            'UPDATE users SET password_changed_at = DATE_SUB(NOW(), INTERVAL ? + 1 DAY), password_expires_at = DATE_SUB(NOW(), INTERVAL 1 DAY) WHERE user_id = ?',
            [diasMax, userId]
        );
    }
};

module.exports = User;
