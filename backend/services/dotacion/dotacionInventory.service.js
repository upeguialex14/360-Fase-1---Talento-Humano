/**
 * Servicio de Inventario y Kardex de Dotación
 * Maneja entradas, salidas, ajustes y registro de movimientos.
 */
const pool = require('../../config/db');
const DotacionInventory = require('../../models/dotacion/dotacionInventory.model');
const DotacionAlertConfig = require('../../models/dotacion/dotacionAlertConfig.model');
const DotacionAlertLog = require('../../models/dotacion/dotacionAlertLog.model');

const DotacionInventoryService = {

    /**
     * Registra un movimiento en el Kardex y actualiza el stock disponible.
     * @param {Object} params - Parámetros del movimiento
     */
    async registerMovement({ item_id, size, type, quantity, delivery_id = null, performed_by, note = null }) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insertar movimiento en DOTACION_INVENTORY_MOVEMENT
            const [moveResult] = await connection.execute(`
                INSERT INTO DOTACION_INVENTORY_MOVEMENT 
                    (item_id, size, movement_type, quantity, delivery_id, performed_by, reference_note)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [item_id, size, type, quantity, delivery_id, performed_by, note]
            );

            // 2. Calcular delta para el stock
            // ENTRADA, DEVOLUCION, REASIGNACION (+)
            // SALIDA (-)
            // AJUSTE (se asume que quantity ya viene con signo si es ajuste manual, o se maneja aparte)
            let delta = quantity;
            if (type === 'SALIDA') delta = -Math.abs(quantity);
            else delta = Math.abs(quantity);

            // 3. Actualizar DOTACION_INVENTORY
            await connection.execute(`
                INSERT INTO DOTACION_INVENTORY (item_id, size, quantity_available)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    quantity_available = quantity_available + ?`,
                [item_id, size, delta, delta]
            );

            await connection.commit();

            // 4. Verificar alertas de stock (fuera de la transacción para no bloquear)
            this.checkAndLogAlert(item_id, size).catch(err => console.error('[DOTACION] Error verificando alertas:', err));

            return moveResult.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
     * Verifica si el stock está bajo el umbral y registra en el log si es necesario.
     */
    async checkAndLogAlert(itemId, size) {
        // Obtener stock actual
        const [inv] = await pool.execute(
            'SELECT quantity_available FROM DOTACION_INVENTORY WHERE item_id = ? AND size = ?',
            [itemId, size]
        );

        if (!inv.length) return;
        const currentQty = inv[0].quantity_available;

        // Obtener umbral (específico o por defecto)
        const config = await DotacionAlertConfig.getByArticle(itemId);
        const threshold = config ? config.min_quantity : 5; // Default 5

        if (currentQty <= threshold) {
            // Verificar si ya hay una alerta pendiente idéntica para evitar spam
            const [existing] = await pool.execute(
                "SELECT log_id FROM DOTACION_ALERT_LOG WHERE item_id = ? AND size = ? AND status = 'PENDIENTE'",
                [itemId, size]
            );

            if (!existing.length) {
                await DotacionAlertLog.create({
                    item_id: itemId,
                    size: size,
                    quantity_at_alert: currentQty,
                    min_threshold: threshold
                });
                console.log(`[DOTACION] Alerta generada: Item ${itemId} Talla ${size} Stock ${currentQty}`);
            }
        }
    },

    /**
     * Obtiene el historial de movimientos (Kardex)
     */
    async getKardex(filters = {}) {
        let where = ['1=1'];
        let params = [];

        if (filters.item_id) { where.push('dim.item_id = ?'); params.push(filters.item_id); }
        if (filters.size) { where.push('dim.size = ?'); params.push(filters.size); }
        if (filters.type) { where.push('dim.movement_type = ?'); params.push(filters.type); }
        if (filters.start_date) { where.push('dim.movement_date >= ?'); params.push(filters.start_date); }
        if (filters.end_date) { where.push('dim.movement_date <= ?'); params.push(filters.end_date); }

        const [rows] = await pool.query(`
            SELECT 
                dim.*, 
                mdi.item_name,
                CONCAT(u.name, ' ', u.last_name) as performed_by_name
            FROM DOTACION_INVENTORY_MOVEMENT dim
            JOIN MASTER_DOTACION_ITEM mdi ON dim.item_id = mdi.item_id
            LEFT JOIN USERS u ON dim.performed_by = u.user_id
            WHERE ${where.join(' AND ')}
            ORDER BY dim.movement_date DESC`,
            params
        );
        return rows;
    },

    /**
     * Procesa una devolución de dotación
     */
    async processReturn(itemId, size, qty, performedBy, note) {
        return await this.registerMovement({
            item_id: itemId,
            size: size,
            type: 'DEVOLUCION',
            quantity: qty,
            performed_by: performedBy,
            note: note || 'Devolución de dotación'
        });
    },

    /**
     * Procesa un ajuste manual de inventario
     */
    async manualAdjustment(itemId, size, qty, performedBy, reason) {
        // qty puede ser positivo o negativo
        return await this.registerMovement({
            item_id: itemId,
            size: size,
            type: 'AJUSTE',
            quantity: qty,
            performed_by: performedBy,
            note: reason || 'Ajuste manual de inventario'
        });
    }
};

module.exports = DotacionInventoryService;
