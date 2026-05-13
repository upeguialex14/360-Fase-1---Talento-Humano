/**
 * Modelo de Pedidos a Proveedor de Dotación
 */
const pool = require('../../config/db');

const DotacionProviderOrder = {
    async getAll(filters = {}) {
        let where = ['1=1'];
        let params = [];

        if (filters.status) { where.push('dpo.status = ?'); params.push(filters.status); }
        if (filters.item_id) { where.push('dpo.item_id = ?'); params.push(filters.item_id); }

        const [rows] = await pool.query(`
            SELECT dpo.*, mdi.item_name
            FROM DOTACION_PROVIDER_ORDER dpo
            JOIN MASTER_DOTACION_ITEM mdi ON dpo.item_id = mdi.item_id
            WHERE ${where.join(' AND ')}
            ORDER BY dpo.order_date DESC`,
            params
        );
        return rows;
    },

    async create(data) {
        const { item_id, size, quantity, provider_name, unit_cost, expected_date } = data;
        const total_cost = (unit_cost || 0) * (quantity || 0);

        const [result] = await pool.execute(`
            INSERT INTO DOTACION_PROVIDER_ORDER 
                (item_id, size, quantity, provider_name, unit_cost, total_cost, expected_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [item_id, size, quantity, provider_name, unit_cost, total_cost, expected_date]
        );
        return result.insertId;
    },

    async updateStatus(orderId, status, receivedDate = null) {
        let sql = 'UPDATE DOTACION_PROVIDER_ORDER SET status = ?';
        let params = [status];

        if (receivedDate || status === 'RECIBIDO') {
            sql += ', received_date = ?';
            params.push(receivedDate || new Date());
        }

        sql += ' WHERE order_id = ?';
        params.push(orderId);

        const [result] = await pool.execute(sql, params);
        return result.affectedRows > 0;
    },

    async getById(orderId) {
        const [rows] = await pool.execute(
            'SELECT * FROM DOTACION_PROVIDER_ORDER WHERE order_id = ?',
            [orderId]
        );
        return rows[0];
    }
};

module.exports = DotacionProviderOrder;
