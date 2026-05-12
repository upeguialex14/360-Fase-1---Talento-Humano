/**
 * Modelo de DOTACION_UNIT_ITEM
 * Mapeo de qué prendas se entregan por unidad de negocio
 * (Transaccional vs Especializada)
 */
const pool = require('../../config/db');

const DotacionUnitItem = {

    async getAll() {
        const [rows] = await pool.query(`
            SELECT 
                dui.unit_item_id,
                dui.unit_id,
                mu.name as unit_name,
                dui.item_id,
                mdi.item_name,
                mdi.category,
                dui.custom_description,
                dui.quantity_per_delivery,
                dui.status_id,
                sm.status as status_name
            FROM DOTACION_UNIT_ITEM dui
            JOIN MASTER_UNIT mu ON dui.unit_id = mu.unit_id
            JOIN MASTER_DOTACION_ITEM mdi ON dui.item_id = mdi.item_id
            LEFT JOIN STATUS_MASTER sm ON dui.status_id = sm.status_id
            ORDER BY mu.name, mdi.category, mdi.item_name
        `);
        return rows;
    },

    async getByUnit(unitId) {
        const [rows] = await pool.execute(`
            SELECT 
                dui.unit_item_id,
                dui.item_id,
                mdi.item_name,
                mdi.category,
                dui.custom_description,
                dui.quantity_per_delivery
            FROM DOTACION_UNIT_ITEM dui
            JOIN MASTER_DOTACION_ITEM mdi ON dui.item_id = mdi.item_id
            WHERE dui.unit_id = ? AND dui.status_id = 1
            ORDER BY mdi.category, mdi.item_name
        `, [unitId]);
        return rows;
    },

    async assign(unitId, itemId, { custom_description, quantity_per_delivery = 1 }) {
        const [result] = await pool.execute(
            `INSERT INTO DOTACION_UNIT_ITEM 
                (unit_id, item_id, custom_description, quantity_per_delivery)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                custom_description = VALUES(custom_description),
                quantity_per_delivery = VALUES(quantity_per_delivery),
                status_id = 1`,
            [unitId, itemId, custom_description || null, quantity_per_delivery]
        );
        return { unit_item_id: result.insertId, unitId, itemId, custom_description, quantity_per_delivery };
    },

    async update(unitItemId, { custom_description, quantity_per_delivery, status_id }) {
        const fields = [];
        const values = [];

        if (custom_description !== undefined) { fields.push('custom_description = ?'); values.push(custom_description); }
        if (quantity_per_delivery !== undefined) { fields.push('quantity_per_delivery = ?'); values.push(quantity_per_delivery); }
        if (status_id !== undefined) { fields.push('status_id = ?'); values.push(status_id); }

        if (fields.length === 0) return null;

        values.push(unitItemId);
        const [result] = await pool.execute(
            `UPDATE DOTACION_UNIT_ITEM SET ${fields.join(', ')} WHERE unit_item_id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    async remove(unitItemId) {
        const [result] = await pool.execute(
            `DELETE FROM DOTACION_UNIT_ITEM WHERE unit_item_id = ?`,
            [unitItemId]
        );
        return result.affectedRows > 0;
    }
};

module.exports = DotacionUnitItem;
