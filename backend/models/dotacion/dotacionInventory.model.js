/**
 * Modelo de DOTACION_INVENTORY
 * Control de stock de prendas por item + talla
 */
const pool = require('../../config/db');

const DotacionInventory = {

    async getAll() {
        const [rows] = await pool.query(`
            SELECT 
                di.inventory_id,
                di.item_id,
                mdi.item_name,
                mdi.category,
                di.size,
                di.quantity_available,
                di.quantity_reserved,
                (di.quantity_available - di.quantity_reserved) as quantity_free,
                di.min_stock_alert,
                di.last_updated,
                CASE 
                    WHEN di.quantity_available <= di.min_stock_alert THEN 1 
                    ELSE 0 
                END as is_low_stock
            FROM DOTACION_INVENTORY di
            JOIN MASTER_DOTACION_ITEM mdi ON di.item_id = mdi.item_id
            ORDER BY mdi.item_name, di.size
        `);
        return rows;
    },

    async getByItem(itemId) {
        const [rows] = await pool.execute(`
            SELECT 
                di.inventory_id,
                di.size,
                di.quantity_available,
                di.quantity_reserved,
                (di.quantity_available - di.quantity_reserved) as quantity_free,
                di.min_stock_alert,
                di.last_updated
            FROM DOTACION_INVENTORY di
            WHERE di.item_id = ?
            ORDER BY di.size
        `, [itemId]);
        return rows;
    },

    async upsert(itemId, size, quantityAvailable, minStockAlert = 5) {
        const [result] = await pool.execute(
            `INSERT INTO DOTACION_INVENTORY 
                (item_id, size, quantity_available, min_stock_alert)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                quantity_available = VALUES(quantity_available),
                min_stock_alert = VALUES(min_stock_alert)`,
            [itemId, size, quantityAvailable, minStockAlert]
        );
        return { item_id: itemId, size, quantity_available: quantityAvailable };
    },

    async adjustStock(itemId, size, quantityDelta) {
        // Ajusta el stock sumando o restando al valor actual
        const [result] = await pool.execute(
            `UPDATE DOTACION_INVENTORY 
             SET quantity_available = quantity_available + ?
             WHERE item_id = ? AND size = ?`,
            [quantityDelta, itemId, size]
        );
        return result.affectedRows > 0;
    },

    async reserveStock(itemId, size, quantity) {
        const [result] = await pool.execute(
            `UPDATE DOTACION_INVENTORY 
             SET quantity_reserved = quantity_reserved + ?
             WHERE item_id = ? AND size = ? 
               AND (quantity_available - quantity_reserved) >= ?`,
            [quantity, itemId, size, quantity]
        );
        return result.affectedRows > 0;
    },

    async releaseReservation(itemId, size, quantity) {
        const [result] = await pool.execute(
            `UPDATE DOTACION_INVENTORY 
             SET quantity_reserved = GREATEST(0, quantity_reserved - ?)
             WHERE item_id = ? AND size = ?`,
            [quantity, itemId, size]
        );
        return result.affectedRows > 0;
    },

    async confirmDelivery(itemId, size, quantity) {
        // Cuando se entrega: baja available y baja reserved
        const [result] = await pool.execute(
            `UPDATE DOTACION_INVENTORY 
             SET quantity_available = quantity_available - ?,
                 quantity_reserved = GREATEST(0, quantity_reserved - ?)
             WHERE item_id = ? AND size = ?`,
            [quantity, quantity, itemId, size]
        );
        return result.affectedRows > 0;
    },

    async getLowStock(threshold = null) {
        const [rows] = await pool.query(`
            SELECT 
                di.inventory_id,
                di.item_id,
                mdi.item_name,
                mdi.category,
                di.size,
                di.quantity_available,
                di.min_stock_alert
            FROM DOTACION_INVENTORY di
            JOIN MASTER_DOTACION_ITEM mdi ON di.item_id = mdi.item_id
            WHERE di.quantity_available <= ${threshold ? '?' : 'di.min_stock_alert'}
            ORDER BY di.quantity_available ASC
        `, threshold ? [threshold] : []);
        return rows;
    }
};

module.exports = DotacionInventory;
