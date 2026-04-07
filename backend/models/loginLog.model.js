const pool = require('../config/db');

class LoginLog {
    static async logLogin(success, userId, username, reason, ip, userAgent) {
        try {
            await pool.execute(
                'INSERT INTO login_logs (user_id, username, success, reason, ip_address, user_agent, login_time) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [userId, username, success, reason, ip, userAgent]
            );
        } catch (err) {
            console.error('[LoginLog] Error logging login:', err);
            // Don't throw - logging errors shouldn't block operations
        }
    }

    static async getFailedLoginAttempts(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT COUNT(*) as failed_attempts FROM login_logs WHERE user_id = ? AND success = 0 AND login_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
                [userId]
            );
            return rows[0].failed_attempts;
        } catch (err) {
            console.error('[LoginLog] Error getting failed attempts:', err);
            return 0;
        }
    }

    static async getFailedLoginAttemptsInHours(userId, hoursBack = 24) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM login_logs 
                 WHERE user_id = ? AND success = 0 AND login_time > DATE_SUB(NOW(), INTERVAL ? HOUR)
                 ORDER BY login_time DESC`,
                [userId, hoursBack]
            );
            return rows;
        } catch (err) {
            console.error('[LoginLog] Error getting failed login attempts:', err);
            return [];
        }
    }

    static async getLoginHistory(userId, limit = 50) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM login_logs WHERE user_id = ? ORDER BY login_time DESC LIMIT ?',
                [userId, limit]
            );
            return rows;
        } catch (err) {
            console.error('[LoginLog] Error getting login history:', err);
            return [];
        }
    }
}

module.exports = LoginLog;