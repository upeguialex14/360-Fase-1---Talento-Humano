/**
 * Config Helper
 * Utility functions for configuration management
 */
const ConfigService = require('../services/config.service');

const getMaxLoginAttempts = async () => {
    return await ConfigService.getMaxLoginAttempts();
};

const getDaysPasswordExpires = async () => {
    return await ConfigService.getDaysPasswordExpires();
};

const getConfig = async (key, defaultValue) => {
    return await ConfigService.getByKey(key, defaultValue);
};

const updateConfig = async (key, value) => {
    return await ConfigService.updateValue(key, value);
};

module.exports = {
    getMaxLoginAttempts,
    getDaysPasswordExpires,
    getConfig,
    updateConfig
};
