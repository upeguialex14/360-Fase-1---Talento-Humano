const pool = require('../config/db');

class HistoricalLogin {
    static async logHistoricalLogin(userId, username, email, ip, userAgent) {
        try {
            // Columns based on real DB check: 
            // user_id, username, email, ip_address, user_agent, login_time
            await pool.execute(
                'INSERT INTO historial_login (user_id, username, email, ip_address, user_agent, login_time) VALUES (?, ?, ?, ?, ?, NOW())',
                [userId, username, email, ip, userAgent]
            );
        } catch (err) {
            console.error('[HistoricalLogin] Error logging historical login:', err);
        }
    }

    static async getAllUserActivity(limit = 100) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM historial_login ORDER BY login_time DESC LIMIT ?',
                [limit]
            );
            return rows;
        } catch (err) {
            console.error('[HistoricalLogin] Error getting all user activity:', err);
            return [];
        }
    }

    static async getLoginHistory(userId, limit = 50) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM historial_login WHERE user_id = ? ORDER BY login_time DESC LIMIT ?',
                [userId, limit]
            );
            return rows;
        } catch (err) {
            console.error('[HistoricalLogin] Error getting login history:', err);
            return [];
        }
    }

    static async logout(userId) {
        try {
            // Column names match real DB: fecha_logout, duracion_minutos, login_time, user_id
            await pool.execute(
                `UPDATE historial_login 
                 SET fecha_logout = NOW(), duracion_minutos = TIMESTAMPDIFF(MINUTE, login_time, NOW())
                 WHERE user_id = ? AND fecha_logout IS NULL
                 ORDER BY login_time DESC
                 LIMIT 1`,
                [userId]
            );
            return { success: true };
        } catch (err) {
            console.error('[HistoricalLogin] Error on logout:', err);
            return { success: false };
        }
    }

    static async getLastSession(userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT login_time FROM historial_login 
                 WHERE user_id = ?
                 ORDER BY login_time DESC
                 LIMIT 1 OFFSET 1`,
                [userId]
            );
            return rows.length > 0 ? rows[0].login_time : null;
        } catch (err) {
            console.error('[HistoricalLogin] Error getting last session:', err);
            return null;
        }
    }
}

module.exports = HistoricalLogin;