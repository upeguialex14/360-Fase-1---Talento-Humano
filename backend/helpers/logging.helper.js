/**
 * Logging Helper
 * Centralized logging utilities for audit trail
 */
const LoggingService = require('../services/logging.service');

const logLogin = async (success, userId, username, reason, ip, userAgent) => {
    return await LoggingService.logLogin(success, userId, username, reason, ip, userAgent);
};

const getLoginHistory = async (userId, limit = 10) => {
    return await LoggingService.getLoginHistory(userId, limit);
};

const getAllUserActivity = async (limit = 100) => {
    return await LoggingService.getAllUserActivity(limit);
};

const getFailedLoginAttempts = async (userId, hoursBack = 24) => {
    return await LoggingService.getFailedLoginAttempts(userId, hoursBack);
};

module.exports = {
    logLogin,
    getLoginHistory,
    getAllUserActivity,
    getFailedLoginAttempts
};
