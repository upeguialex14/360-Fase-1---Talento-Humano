/**
 * Modelo de DOTACION_CLIENT_CONFIG
 * Configuración de excepciones día-1 por cliente
 * (clientes que requieren dotación desde el primer día de ingreso)
 */
const pool = require('../../config/db');

const DotacionClientConfig = {

    async getAll() {
        const [rows] = await pool.query(`
            SELECT 
                dcc.config_id,
                dcc.client_id,
                mc.name as client_name,
                dcc.requires_day_one,
                dcc.notes,
                dcc.created_at
            FROM DOTACION_CLIENT_CONFIG dcc
            JOIN MASTER_CLIENT mc ON dcc.client_id = mc.client_id
            ORDER BY mc.name
        `);
        return rows;
    },

    async getByClient(clientId) {
        const [rows] = await pool.execute(
            `SELECT dcc.*, mc.name as client_name
             FROM DOTACION_CLIENT_CONFIG dcc
             JOIN MASTER_CLIENT mc ON dcc.client_id = mc.client_id
             WHERE dcc.client_id = ?`,
            [clientId]
        );
        return rows[0] || null;
    },

    async getDayOneClients() {
        const [rows] = await pool.query(`
            SELECT dcc.client_id
            FROM DOTACION_CLIENT_CONFIG dcc
            WHERE dcc.requires_day_one = 1
        `);
        return rows.map(r => r.client_id);
    },

    async upsert(clientId, requiresDayOne, notes = null) {
        const [result] = await pool.execute(
            `INSERT INTO DOTACION_CLIENT_CONFIG 
                (client_id, requires_day_one, notes)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE
                requires_day_one = VALUES(requires_day_one),
                notes = VALUES(notes)`,
            [clientId, requiresDayOne ? 1 : 0, notes]
        );
        return { client_id: clientId, requires_day_one: requiresDayOne, notes };
    },

    async remove(clientId) {
        const [result] = await pool.execute(
            `DELETE FROM DOTACION_CLIENT_CONFIG WHERE client_id = ?`,
            [clientId]
        );
        return result.affectedRows > 0;
    }
};

module.exports = DotacionClientConfig;
