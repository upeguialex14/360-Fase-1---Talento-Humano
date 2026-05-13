/**
 * Modelo de Log de Alertas de Stock
 * Registra cada vez que el sistema detecta stock bajo el umbral.
 */
const pool = require('../../config/db');

const DotacionAlertLog = {
    async getAll(limit = 100) {
        const [rows] = await pool.query(`
            SELECT dal.log_id, dal.item_id, mdi.item_name, dal.size, dal.quantity_at_alert, dal.min_threshold, dal.status, dal.created_at
            FROM DOTACION_ALERT_LOG dal
            JOIN MASTER_DOTACION_ITEM mdi ON dal.item_id = mdi.item_id
            ORDER BY dal.created_at DESC
            LIMIT ?`,
            [limit]
        );
        return rows;
    },

    async create({ item_id, size, quantity_at_alert, min_threshold }) {
        const [result] = await pool.execute(`
            INSERT INTO DOTACION_ALERT_LOG (item_id, size, quantity_at_alert, min_threshold)
            VALUES (?, ?, ?, ?)
        `, [item_id, size, quantity_at_alert, min_threshold]);
        return result.insertId;
    },

    async updateStatus(logId, status) {
        const [result] = await pool.execute(
            `UPDATE DOTACION_ALERT_LOG SET status = ? WHERE log_id = ?`,
            [status, logId]
        );
        return result.affectedRows > 0;
    },

    async getPendingAlerts() {
        const [rows] = await pool.query(`
            SELECT dal.*, mdi.item_name
            FROM DOTACION_ALERT_LOG dal
            JOIN MASTER_DOTACION_ITEM mdi ON dal.item_id = mdi.item_id
            WHERE dal.status = 'PENDIENTE'
            ORDER BY dal.created_at DESC`
        );
        return rows;
    }
};

module.exports = DotacionAlertLog;
