/**
 * Modelo de Parámetros
 * Encapsulates all parameter-related database queries
 */
const pool = require('../config/db');

const Parameter = {
    async getByKey(key) {
        try {
            const [rows] = await pool.execute(
                'SELECT param_value FROM parameters WHERE param_key = ?',
                [key]
            );
            return rows.length > 0 ? parseInt(rows[0].param_value) : null;
        } catch (err) {
            console.error('[ParameterModel] Error getting parameter:', err);
            return null;
        }
    },

    async getByKeyRaw(key) {
        const [rows] = await pool.execute(
            'SELECT param_value FROM parameters WHERE param_key = ?',
            [key]
        );
        return rows.length > 0 ? rows[0].param_value : null;
    },

    async getAll() {
        const [rows] = await pool.execute('SELECT * FROM parameters');
        return rows;
    },

    async updateValue(key, value) {
        await pool.execute(
            'INSERT INTO parameters (param_key, param_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE param_value = VALUES(param_value)',
            [key, value]
        );
    },

    async getAllRaw() {
        try {
            const [rows] = await pool.execute('SELECT * FROM parameters');
            return rows;
        } catch (err) {
            console.error('[ParameterModel] Error getting all parameters:', err);
            return [];
        }
    }
};

module.exports = Parameter;
