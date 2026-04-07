/**
 * Config Service
 * Centralized configuration management with caching (5 min TTL)
 * NO DATABASE QUERIES - ALL DB ACCESS THROUGH MODELS
 */
const Parameter = require('../models/parameter.model');

class ConfigService {
    constructor() {
        this.cache = new Map();
        this.cacheTimestamps = new Map();
        this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
    }

    isExpired(key) {
        const timestamp = this.cacheTimestamps.get(key);
        if (!timestamp) return true;
        return Date.now() - timestamp > this.CACHE_TTL;
    }

    async getByKey(key, defaultValue = null) {
        try {
            // Check cache
            if (this.cache.has(key) && !this.isExpired(key)) {
                return this.cache.get(key);
            }

            // Query database through model
            const value = await Parameter.getByKeyRaw(key);

            if (value) {
                this.cache.set(key, value);
                this.cacheTimestamps.set(key, Date.now());
                return value;
            }

            return defaultValue;
        } catch (err) {
            console.error('[ConfigService] Error getting config:', err);
            return defaultValue;
        }
    }

    async getAllConfigs() {
        try {
            const rows = await Parameter.getAllRaw();
            // Populate cache
            rows.forEach(row => {
                this.cache.set(row.param_key, row.param_value);
                this.cacheTimestamps.set(row.param_key, Date.now());
            });
            return rows;
        } catch (err) {
            console.error('[ConfigService] Error getting all configs:', err);
            return [];
        }
    }

    async updateValue(key, value) {
        try {
            await Parameter.updateValue(key, value);
            // Invalidate cache
            this.cache.delete(key);
            this.cacheTimestamps.delete(key);
            return { success: true };
        } catch (err) {
            console.error('[ConfigService] Error updating config:', err);
            throw err;
        }
    }

    // Convenience methods for common configs
    async getMaxLoginAttempts() {
        const val = await this.getByKey('max_login_attempts', '5');
        return parseInt(val);
    }

    async getDaysPasswordExpires() {
        const val = await this.getByKey('dias_cambio_pwd', '30');
        return parseInt(val);
    }

    clearCache() {
        this.cache.clear();
        this.cacheTimestamps.clear();
    }
}

module.exports = new ConfigService();
