/**
 * Modelo de MASTER_DOTACION_ITEM
 * Catálogo de prendas de dotación (Camisa, Pantalón, Zapatos, etc.)
 */
const pool = require('../../config/db');

const MasterDotacionItem = {

    async getAll() {
        const [rows] = await pool.query(`
            SELECT 
                mdi.item_id,
                mdi.item_name,
                mdi.category,
                mdi.status_id,
                sm.status as status_name,
                mdi.created_at
            FROM MASTER_DOTACION_ITEM mdi
            LEFT JOIN STATUS_MASTER sm ON mdi.status_id = sm.status_id
            ORDER BY mdi.category, mdi.item_name
        `);
        return rows;
    },

    async getById(itemId) {
        const [rows] = await pool.execute(
            `SELECT mdi.*, sm.status as status_name
             FROM MASTER_DOTACION_ITEM mdi
             LEFT JOIN STATUS_MASTER sm ON mdi.status_id = sm.status_id
             WHERE mdi.item_id = ?`,
            [itemId]
        );
        return rows[0] || null;
    },

    async create({ item_name, category, status_id = 1 }) {
        const [result] = await pool.execute(
            `INSERT INTO MASTER_DOTACION_ITEM (item_name, category, status_id) VALUES (?, ?, ?)`,
            [item_name, category || null, status_id]
        );
        return { item_id: result.insertId, item_name, category, status_id };
    },

    async update(itemId, { item_name, category, status_id }) {
        const fields = [];
        const values = [];

        if (item_name !== undefined) { fields.push('item_name = ?'); values.push(item_name); }
        if (category !== undefined) { fields.push('category = ?'); values.push(category); }
        if (status_id !== undefined) { fields.push('status_id = ?'); values.push(status_id); }

        if (fields.length === 0) return null;

        values.push(itemId);
        const [result] = await pool.execute(
            `UPDATE MASTER_DOTACION_ITEM SET ${fields.join(', ')} WHERE item_id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    async deactivate(itemId) {
        // Soft delete: cambiar status a Inactivo (2)
        const [result] = await pool.execute(
            `UPDATE MASTER_DOTACION_ITEM SET status_id = 2 WHERE item_id = ?`,
            [itemId]
        );
        return result.affectedRows > 0;
    }
};

module.exports = MasterDotacionItem;
