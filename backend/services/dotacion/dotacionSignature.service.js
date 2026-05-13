/**
 * Servicio de Firma Digital para Dotación
 * Maneja la generación de tokens y el proceso de firma del empleado.
 */
const crypto = require('crypto');
const pool = require('../../config/db');
const DotacionDelivery = require('../../models/dotacion/dotacionDelivery.model');

const DotacionSignatureService = {

    /**
     * Genera un token de firma para una entrega
     */
    async generateToken(deliveryId) {
        const token = crypto.randomBytes(32).toString('hex');
        
        await pool.execute(
            'UPDATE DOTACION_DELIVERY SET signature_token = ? WHERE delivery_id = ?',
            [token, deliveryId]
        );
        
        return token;
    },

    /**
     * Valida un token de firma y devuelve los datos de la entrega
     * (Usado por la ruta pública de firma)
     */
    async validateToken(token) {
        const [rows] = await pool.execute(`
            SELECT 
                dd.delivery_id, dd.people_id, dd.period_number, dd.period_year,
                p.cedula, CONCAT(p.name, ' ', p.last_name) as full_name,
                mes.status_endowment as status_name
            FROM DOTACION_DELIVERY dd
            JOIN PEOPLE p ON dd.people_id = p.people_id
            JOIN MASTER_STATUS_ENDOWMENT mes ON dd.status_id = mes.status_id
            WHERE dd.signature_token = ?`,
            [token]
        );

        if (rows.length === 0) return null;

        const delivery = rows[0];

        // Obtener detalles de la entrega (items a firmar)
        const [details] = await pool.execute(`
            SELECT ddd.*, mdi.item_name
            FROM DOTACION_DELIVERY_DETAIL ddd
            JOIN MASTER_DOTACION_ITEM mdi ON ddd.item_id = mdi.item_id
            WHERE ddd.delivery_id = ?`,
            [delivery.delivery_id]
        );

        delivery.details = details;
        return delivery;
    },

    /**
     * Registra la firma digital
     */
    async saveSignature(token, signatureBase64, ipAddress) {
        const delivery = await this.validateToken(token);
        if (!delivery) throw new Error('Token de firma inválido');

        if (delivery.status_name === 'Firmado') {
            throw new Error('Esta entrega ya ha sido firmada');
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Obtener ID de estado 'Firmado'
            const [statusRow] = await connection.execute(
                "SELECT status_id FROM MASTER_STATUS_ENDOWMENT WHERE status_endowment = 'Firmado'"
            );
            const firmadoStatusId = statusRow[0]?.status_id || 5;

            // Actualizar entrega con la firma
            await connection.execute(`
                UPDATE DOTACION_DELIVERY SET 
                    digital_signature = ?,
                    signed_at = CURRENT_TIMESTAMP,
                    signature_ip = ?,
                    status_id = ?,
                    signature_token = NULL -- Invalidar token después de usar
                WHERE delivery_id = ?`,
                [signatureBase64, ipAddress, firmadoStatusId, delivery.delivery_id]
            );

            await connection.commit();
            return { success: true, message: 'Firma registrada exitosamente' };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = DotacionSignatureService;
