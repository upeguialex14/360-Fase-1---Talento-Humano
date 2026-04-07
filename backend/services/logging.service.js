/**
 * Logging Service
 * Centralized logging for audit trail and user activity
 * NO DATABASE QUERIES - ALL DB ACCESS THROUGH MODELS
 */
const LoginLog = require('../models/loginLog.model');
const UserLockHistory = require('../models/userLockHistory.model');
const HistoricalLogin = require('../models/historicalLogin.model');

class LoggingService {
    async logLogin(success, userId, username, reason, ip, userAgent) {
        try {
            await LoginLog.logLogin(success, userId, username, reason, ip, userAgent);
        } catch (err) {
            console.error('[LoggingService] Error logging login:', err);
            // Don't throw - logging errors shouldn't block operations
        }
    }

    async logLockHistory(userId, login, email, failedAttempts) {
        try {
            await UserLockHistory.logLock(userId, login, email);
        } catch (err) {
            console.error('[LoggingService] Error logging lock history:', err);
        }
    }

    async getLoginHistory(userId, limit = 10) {
        try {
            const rows = await LoginLog.getLoginHistory(userId, limit);
            return rows;
        } catch (err) {
            console.error('[LoggingService] Error getting login history:', err);
            return [];
        }
    }

    async getAllUserActivity(limit = 100) {
        try {
            const rows = await HistoricalLogin.getAllUserActivity(limit);
            return rows;
        } catch (err) {
            console.error('[LoggingService] Error getting all user activity:', err);
            return [];
        }
    }

    async getFailedLoginAttempts(userId, hoursBack = 24) {
        try {
            const rows = await LoginLog.getFailedLoginAttemptsInHours(userId, hoursBack);
            return rows;
        } catch (err) {
            console.error('[LoggingService] Error getting failed login attempts:', err);
            return [];
        }
    }

    async getLockHistory(userId) {
        try {
            const rows = await UserLockHistory.getLockHistory(userId);
            return rows;
        } catch (err) {
            console.error('[LoggingService] Error getting lock history:', err);
            return [];
        }
    }
}

module.exports = new LoggingService();
