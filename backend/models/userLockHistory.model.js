const pool = require('../config/db');

class UserLockHistory {
    static async logLock(userId, login, email, reason = 'Manual block by admin') {
        try {
            await pool.execute(
                'INSERT INTO user_lock_history (user_id, login, email, failed_attempts, locked_at) VALUES (?, ?, ?, 0, NOW())',
                [userId, login, email]
            );
        } catch (err) {
            console.error('[UserLockHistory] Error logging lock:', err);
            // Don't throw - logging errors shouldn't block operations
        }
    }

    static async logUnlock(userId) {
        try {
            await pool.execute(
                'UPDATE user_lock_history SET unlocked_at = NOW() WHERE user_id = ? AND unlocked_at IS NULL ORDER BY locked_at DESC LIMIT 1',
                [userId]
            );
        } catch (err) {
            console.error('[UserLockHistory] Error logging unlock:', err);
            // Don't throw - logging errors shouldn't block operations
        }
    }

    static async getLockHistory(userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM user_lock_history 
                 WHERE user_id = ?
                 ORDER BY locked_at DESC`,
                [userId]
            );
            return rows;
        } catch (err) {
            console.error('[UserLockHistory] Error getting lock history:', err);
            return [];
        }
    }
}

module.exports = UserLockHistory;