/**
 * Servicio de Logística y Envíos de Dotación
 * Maneja guías de transporte y estados de envío.
 */
const pool = require('../../config/db');

const DotacionShippingService = {

    /**
     * Actualiza la información de envío de una entrega
     */
    async updateShippingInfo(deliveryId, { carrier, guide, status, notes }) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const fields = [];
            const params = [];

            if (carrier) { fields.push('shipping_carrier = ?'); params.push(carrier); }
            if (guide) { fields.push('shipping_guide = ?'); params.push(guide); }
            if (status) { fields.push('shipping_status = ?'); params.push(status); }
            if (notes) { fields.push('observations = CONCAT(IFNULL(observations,""), "\n", ?)'); params.push(notes); }

            if (fields.length === 0) return { success: false, message: 'Nada que actualizar' };

            // Si se registra guía, se asume que la fecha de envío es hoy (si no estaba ya)
            if (guide) {
                fields.push('shipping_date = IFNULL(shipping_date, CURRENT_TIMESTAMP)');
            }

            params.push(deliveryId);

            await connection.execute(
                `UPDATE DOTACION_DELIVERY SET ${fields.join(', ')} WHERE delivery_id = ?`,
                params
            );

            await connection.commit();
            return { success: true, message: 'Información de envío actualizada' };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
     * Obtiene una lista de transportadoras comunes
     * (Puede ser extendido a una tabla maestra en el futuro)
     */
    getCommonCarriers() {
        return [
            'Servientrega',
            'Envia',
            'Interrapidisimo',
            'Coordinadora',
            'TCC',
            'Entrega Interna'
        ];
    },

    /**
     * Obtiene entregas filtradas por estado de envío
     */
    async getDeliveriesByShippingStatus(status) {
        const [rows] = await pool.execute(`
            SELECT 
                dd.*, p.cedula, CONCAT(p.name, ' ', p.last_name) as person_name
            FROM DOTACION_DELIVERY dd
            JOIN PEOPLE p ON dd.people_id = p.people_id
            WHERE dd.shipping_status = ?`,
            [status]
        );
        return rows;
    }
};

module.exports = DotacionShippingService;
