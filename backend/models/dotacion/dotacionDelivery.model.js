/**
 * Modelo de DOTACION_DELIVERY + DOTACION_DELIVERY_DETAIL
 * Entregas de dotación (×3 por año por persona)
 */
const pool = require('../../config/db');

const DotacionDelivery = {

    async getAll(filters = {}) {
        let where = ['1=1'];
        let params = [];

        if (filters.year) { where.push('dd.period_year = ?'); params.push(filters.year); }
        if (filters.period) { where.push('dd.period_number = ?'); params.push(filters.period); }
        if (filters.status_id) { where.push('dd.status_id = ?'); params.push(filters.status_id); }
        if (filters.unit_id) { where.push('dd.unit_id = ?'); params.push(filters.unit_id); }
        if (filters.plan_id) { where.push('dd.plan_id = ?'); params.push(filters.plan_id); }

        const [rows] = await pool.query(`
            SELECT 
                dd.delivery_id,
                dd.plan_id,
                dd.people_id,
                p.document_number as cedula,
                CONCAT(p.first_name, ' ', p.last_name) as nombre_completo,
                dd.unit_id,
                mu.name as unit_name,
                dd.period_number,
                dd.period_year,
                CASE dd.period_number 
                    WHEN 1 THEN 'Abril'
                    WHEN 2 THEN 'Agosto'
                    WHEN 3 THEN 'Nov-Dic'
                END as period_name,
                dd.analyst_id,
                CONCAT(ua.name, ' ', ua.last_name) as analyst_name,
                dd.shipping_guide,
                dd.shipping_carrier,
                dd.shipping_status,
                dd.shipping_date,
                dd.signed_at,
                dd.status_id,
                mse.status_endowment as status_name,
                dd.observations,
                dd.created_at
            FROM DOTACION_DELIVERY dd
            JOIN PEOPLE p ON dd.people_id = p.people_id
            LEFT JOIN MASTER_UNIT mu ON dd.unit_id = mu.unit_id
            LEFT JOIN USERS ua ON dd.analyst_id = ua.user_id
            LEFT JOIN MASTER_STATUS_ENDOWMENT mse ON dd.status_id = mse.status_id
            WHERE ${where.join(' AND ')}
            ORDER BY dd.period_year DESC, dd.period_number, p.last_name
        `, params);
        return rows;
    },

    async getById(deliveryId) {
        const [deliveryRows] = await pool.execute(`
            SELECT 
                dd.*,
                p.document_number as cedula,
                CONCAT(p.first_name, ' ', p.last_name) as nombre_completo,
                p.email,
                mu.name as unit_name,
                mse.status_endowment as status_name,
                CONCAT(ua.name, ' ', ua.last_name) as analyst_name
            FROM DOTACION_DELIVERY dd
            JOIN PEOPLE p ON dd.people_id = p.people_id
            LEFT JOIN MASTER_UNIT mu ON dd.unit_id = mu.unit_id
            LEFT JOIN MASTER_STATUS_ENDOWMENT mse ON dd.status_id = mse.status_id
            LEFT JOIN USERS ua ON dd.analyst_id = ua.user_id
            WHERE dd.delivery_id = ?
        `, [deliveryId]);

        if (deliveryRows.length === 0) return null;

        // Obtener detalles de la entrega
        const [details] = await pool.execute(`
            SELECT 
                ddd.detail_id,
                ddd.item_id,
                mdi.item_name,
                mdi.category,
                ddd.size_requested,
                ddd.size_delivered,
                ddd.quantity
            FROM DOTACION_DELIVERY_DETAIL ddd
            JOIN MASTER_DOTACION_ITEM mdi ON ddd.item_id = mdi.item_id
            WHERE ddd.delivery_id = ?
            ORDER BY mdi.category, mdi.item_name
        `, [deliveryId]);

        return { ...deliveryRows[0], details };
    },

    async getByPerson(peopleId, year = null) {
        let query = `
            SELECT 
                dd.delivery_id,
                dd.period_number,
                dd.period_year,
                dd.status_id,
                mse.status_endowment as status_name,
                dd.signed_at,
                dd.shipping_status,
                mu.name as unit_name
            FROM DOTACION_DELIVERY dd
            LEFT JOIN MASTER_STATUS_ENDOWMENT mse ON dd.status_id = mse.status_id
            LEFT JOIN MASTER_UNIT mu ON dd.unit_id = mu.unit_id
            WHERE dd.people_id = ?
        `;
        const params = [peopleId];

        if (year) {
            query += ' AND dd.period_year = ?';
            params.push(year);
        }

        query += ' ORDER BY dd.period_year DESC, dd.period_number';
        const [rows] = await pool.execute(query, params);
        return rows;
    },

    async create(deliveryData, details = []) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [result] = await connection.execute(
                `INSERT INTO DOTACION_DELIVERY 
                    (plan_id, people_id, unit_id, period_number, period_year, analyst_id, status_id, observations)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    deliveryData.plan_id || null,
                    deliveryData.people_id,
                    deliveryData.unit_id || null,
                    deliveryData.period_number,
                    deliveryData.period_year,
                    deliveryData.analyst_id || null,
                    deliveryData.status_id || 1,
                    deliveryData.observations || null
                ]
            );

            const deliveryId = result.insertId;

            // Insertar detalles
            for (const detail of details) {
                await connection.execute(
                    `INSERT INTO DOTACION_DELIVERY_DETAIL 
                        (delivery_id, item_id, size_requested, size_delivered, quantity)
                     VALUES (?, ?, ?, ?, ?)`,
                    [deliveryId, detail.item_id, detail.size_requested || null, detail.size_delivered || null, detail.quantity || 1]
                );
            }

            await connection.commit();
            return deliveryId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async createBulk(deliveries) {
        let created = 0;
        let errors = [];

        for (const { delivery, details } of deliveries) {
            try {
                await this.create(delivery, details);
                created++;
            } catch (e) {
                if (e.code === 'ER_DUP_ENTRY') {
                    errors.push(`Persona ${delivery.people_id}: ya tiene entrega en período ${delivery.period_number}/${delivery.period_year}`);
                } else {
                    errors.push(`Persona ${delivery.people_id}: ${e.message}`);
                }
            }
        }

        return { created, errors };
    },

    async updateStatus(deliveryId, statusId) {
        const [result] = await pool.execute(
            `UPDATE DOTACION_DELIVERY SET status_id = ? WHERE delivery_id = ?`,
            [statusId, deliveryId]
        );
        return result.affectedRows > 0;
    },

    async updateSizes(deliveryId, sizeUpdates) {
        // sizeUpdates = [{ detail_id, size_requested }]
        let updated = 0;
        for (const update of sizeUpdates) {
            const [result] = await pool.execute(
                `UPDATE DOTACION_DELIVERY_DETAIL 
                 SET size_requested = ? 
                 WHERE detail_id = ? AND delivery_id = ?`,
                [update.size_requested, update.detail_id, deliveryId]
            );
            if (result.affectedRows > 0) updated++;
        }
        return updated;
    },

    async cancelPendingByPerson(peopleId, periodYear) {
        // Cancela entregas pendientes de una persona (por retiro)
        const [cancelStatus] = await pool.execute(
            `SELECT status_id FROM MASTER_STATUS_ENDOWMENT WHERE status_endowment = 'Cancelado'`
        );
        const cancelId = cancelStatus[0]?.status_id;
        if (!cancelId) return 0;

        const [result] = await pool.execute(
            `UPDATE DOTACION_DELIVERY 
             SET status_id = ?, observations = CONCAT(COALESCE(observations, ''), ' | Cancelado por retiro')
             WHERE people_id = ? AND period_year = ?
               AND status_id IN (
                   SELECT status_id FROM MASTER_STATUS_ENDOWMENT 
                   WHERE status_endowment IN ('Pendiente', 'Aprobado', 'En Preparación')
               )`,
            [cancelId, peopleId, periodYear]
        );
        return result.affectedRows;
    },

    async getDeliveryStats(year, period = null) {
        let where = 'dd.period_year = ?';
        let params = [year];
        if (period) { where += ' AND dd.period_number = ?'; params.push(period); }

        const [rows] = await pool.query(`
            SELECT 
                dd.period_number,
                mse.status_endowment as status_name,
                COUNT(*) as total
            FROM DOTACION_DELIVERY dd
            LEFT JOIN MASTER_STATUS_ENDOWMENT mse ON dd.status_id = mse.status_id
            WHERE ${where}
            GROUP BY dd.period_number, mse.status_endowment
            ORDER BY dd.period_number, mse.status_endowment
        `, params);
        return rows;
    }
};

module.exports = DotacionDelivery;
