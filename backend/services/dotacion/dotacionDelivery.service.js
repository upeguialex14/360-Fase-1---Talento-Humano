/**
 * Servicio de Entregas de Dotación
 * 
 * Lógica:
 * - Genera entregas desde un plan anual para un período específico
 * - Lee tallas actuales de PEOPLE_DETAILS al generar
 * - Permite actualizar tallas pre-entrega (solo tallaje, no cantidad)
 * - Procesa entrega: descuenta inventario + registra Kardex
 */
const pool = require('../../config/db');
const DotacionDelivery = require('../../models/dotacion/dotacionDelivery.model');
const DotacionPlanPersona = require('../../models/dotacion/dotacionPlanPersona.model');
const DotacionInventory = require('../../models/dotacion/dotacionInventory.model');
const DotacionUnitItem = require('../../models/dotacion/dotacionUnitItem.model');
const DotacionInventoryService = require('./dotacionInventory.service');

const DotacionDeliveryService = {

    /**
     * Genera entregas desde un plan para un período específico
     * Lee las tallas actuales de cada persona y crea la entrega con los items de su unidad
     */
    async generateDeliveriesFromPlan(planId, periodNumber, analystId = null) {
        // 1. Obtener personas INCLUIDAS del plan
        const people = await DotacionPlanPersona.getByPlan(planId);
        const included = people.filter(p => p.status === 'INCLUIDO');

        if (included.length === 0) {
            return { success: false, message: 'No hay personas incluidas en el plan', created: 0 };
        }

        // 2. Obtener año del plan
        const [planRow] = await pool.execute(
            'SELECT plan_year FROM DOTACION_PLAN_ANUAL WHERE plan_id = ?', [planId]
        );
        if (planRow.length === 0) throw new Error('Plan no encontrado');
        const periodYear = planRow[0].plan_year;

        // 3. Cachear items por unidad para evitar queries repetitivos
        const unitItemsCache = {};

        // 4. Preparar entregas
        const deliveries = [];

        for (const person of included) {
            // Obtener la unidad actual (puede haber rotado)
            const currentUnitId = person.current_unit_id || person.unit_id_at_plan;

            if (!currentUnitId) {
                console.warn(`[DOTACION] Persona ${person.cedula}: sin unidad asignada, se omite`);
                continue;
            }

            // Obtener items de la unidad (con caché)
            if (!unitItemsCache[currentUnitId]) {
                unitItemsCache[currentUnitId] = await DotacionUnitItem.getByUnit(currentUnitId);
            }
            const unitItems = unitItemsCache[currentUnitId];

            if (unitItems.length === 0) {
                console.warn(`[DOTACION] Unidad ${currentUnitId}: sin items configurados, se omite persona ${person.cedula}`);
                continue;
            }

            // Mapear tallas de la persona a los items
            const sizeMap = {
                'Camisa': person.t_camisa,
                'Pantalón': person.t_pantalon,
                'Zapatos': person.t_zapatos,
                'Chaqueta': person.t_chaqueta,
                'Chaleco': person.t_chaleco
            };

            const details = unitItems.map(item => ({
                item_id: item.item_id,
                size_requested: sizeMap[item.item_name] || null,
                size_delivered: null, // Se llena al entregar
                quantity: item.quantity_per_delivery || 1
            }));

            deliveries.push({
                delivery: {
                    plan_id: planId,
                    people_id: person.people_id,
                    unit_id: currentUnitId,
                    period_number: periodNumber,
                    period_year: periodYear,
                    analyst_id: analystId,
                    status_id: 1 // Pendiente
                },
                details
            });
        }

        // 5. Crear entregas en bulk
        const result = await DotacionDelivery.createBulk(deliveries);

        console.log(`[DOTACION] Entregas generadas: ${result.created}/${deliveries.length} para plan ${planId}, período ${periodNumber}`);

        return {
            success: true,
            plan_id: planId,
            period_number: periodNumber,
            period_year: periodYear,
            total_people: included.length,
            deliveries_created: result.created,
            errors: result.errors
        };
    },

    /**
     * Actualiza tallas pre-entrega
     * Solo actualiza tallaje (en PEOPLE_DETAILS y en el detalle de la entrega), NO la cantidad
     */
    async updateSizesPreDelivery(deliveryId, sizeUpdates) {
        // sizeUpdates = { t_camisa: 'L', t_pantalon: '32', ... }
        // O: [{ detail_id: 1, size_requested: 'L' }, ...]

        const delivery = await DotacionDelivery.getById(deliveryId);
        if (!delivery) throw new Error('Entrega no encontrada');

        // Si vienen como objeto de tallas, actualizar PEOPLE_DETAILS
        if (sizeUpdates.t_camisa !== undefined || sizeUpdates.t_pantalon !== undefined) {
            const fields = [];
            const values = [];

            if (sizeUpdates.t_camisa !== undefined) { fields.push('size_shirt = ?'); values.push(sizeUpdates.t_camisa); }
            if (sizeUpdates.t_pantalon !== undefined) { fields.push('size_jean = ?'); values.push(sizeUpdates.t_pantalon); }
            if (sizeUpdates.t_zapatos !== undefined) { fields.push('size_shoes = ?'); values.push(sizeUpdates.t_zapatos); }
            if (sizeUpdates.t_chaqueta !== undefined) { fields.push('size_jacket = ?'); values.push(sizeUpdates.t_chaqueta); }
            if (sizeUpdates.t_chaleco !== undefined) { fields.push('size_vest = ?'); values.push(sizeUpdates.t_chaleco); }

            if (fields.length > 0) {
                // Obtener details_id de la persona
                const [person] = await pool.execute(
                    'SELECT details_id FROM PEOPLE WHERE people_id = ?',
                    [delivery.people_id]
                );

                if (person.length > 0 && person[0].details_id) {
                    values.push(person[0].details_id);
                    await pool.execute(
                        `UPDATE PEOPLE_DETAILS SET ${fields.join(', ')} WHERE details_id = ?`,
                        values
                    );
                }
            }

            // Actualizar también en los detalles de la entrega
            const sizeMap = {
                'Camisa': sizeUpdates.t_camisa,
                'Pantalón': sizeUpdates.t_pantalon,
                'Zapatos': sizeUpdates.t_zapatos,
                'Chaqueta': sizeUpdates.t_chaqueta,
                'Chaleco': sizeUpdates.t_chaleco
            };

            for (const detail of delivery.details) {
                const newSize = sizeMap[detail.item_name];
                if (newSize !== undefined) {
                    await pool.execute(
                        'UPDATE DOTACION_DELIVERY_DETAIL SET size_requested = ? WHERE detail_id = ?',
                        [newSize, detail.detail_id]
                    );
                }
            }

            return { success: true, message: 'Tallas actualizadas en persona y entrega' };
        }

        // Si vienen como array de detalles, actualizar solo los detalles
        if (Array.isArray(sizeUpdates)) {
            const updated = await DotacionDelivery.updateSizes(deliveryId, sizeUpdates);
            return { success: true, updated };
        }

        return { success: false, message: 'Formato de actualización no reconocido' };
    },

    /**
     * Procesa una entrega:
     * 1. Verifica stock
     * 2. Descuenta inventario
     * 3. Registra movimientos Kardex
     * 4. Cambia estado a Entregado
     */
    async processDelivery(deliveryId, performedBy = null) {
        const delivery = await DotacionDelivery.getById(deliveryId);
        if (!delivery) throw new Error('Entrega no encontrada');

        // Verificar que esté en estado válido para procesar
        const validStatuses = ['Pendiente', 'Aprobado', 'En Preparación'];
        if (!validStatuses.includes(delivery.status_name)) {
            throw new Error(`No se puede procesar una entrega en estado "${delivery.status_name}"`);
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Para cada item del detalle
            for (const detail of delivery.details) {
                const size = detail.size_delivered || detail.size_requested;
                if (!size) continue;

                // 1. Descontar stock (Usa el modelo directamente para control fino en la transacción)
                const stockOk = await DotacionInventory.confirmDelivery(detail.item_id, size, detail.quantity);

                // 2. Registrar movimiento Kardex (Usa el servicio para consistencia)
                await connection.execute(
                    `INSERT INTO DOTACION_INVENTORY_MOVEMENT 
                        (item_id, size, movement_type, quantity, delivery_id, performed_by, reference_note)
                     VALUES (?, ?, 'SALIDA', ?, ?, ?, ?)`,
                    [
                        detail.item_id,
                        size,
                        detail.quantity,
                        deliveryId,
                        performedBy,
                        `Entrega período ${delivery.period_number}/${delivery.period_year} - ${delivery.cedula}`
                    ]
                );

                // Marcar talla entregada si no estaba
                if (!detail.size_delivered) {
                    await connection.execute(
                        'UPDATE DOTACION_DELIVERY_DETAIL SET size_delivered = ? WHERE detail_id = ?',
                        [size, detail.detail_id]
                    );
                }
            }

            // Cambiar estado a Entregado
            const [entregadoStatus] = await connection.execute(
                "SELECT status_id FROM MASTER_STATUS_ENDOWMENT WHERE status_endowment = 'Entregado'"
            );
            const entregadoId = entregadoStatus[0]?.status_id || 4;

            await connection.execute(
                'UPDATE DOTACION_DELIVERY SET status_id = ? WHERE delivery_id = ?',
                [entregadoId, deliveryId]
            );

            await connection.commit();

            // 3. Post-commit: Verificar alertas para todos los items afectados
            for (const detail of delivery.details) {
                const size = detail.size_delivered || detail.size_requested;
                if (size) {
                    DotacionInventoryService.checkAndLogAlert(detail.item_id, size)
                        .catch(err => console.error('[DOTACION] Error post-delivery alert check:', err));
                }
            }

            return {
                success: true,
                delivery_id: deliveryId,
                items_processed: delivery.details.length,
                message: 'Entrega procesada y alertas verificadas'
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
     * Obtiene entregas con filtros
     */
    async getDeliveries(filters = {}) {
        return await DotacionDelivery.getAll(filters);
    },

    /**
     * Obtiene una entrega con sus detalles
     */
    async getDeliveryById(deliveryId) {
        return await DotacionDelivery.getById(deliveryId);
    },

    /**
     * Obtiene entregas de una persona
     */
    async getPersonDeliveries(peopleId, year = null) {
        return await DotacionDelivery.getByPerson(peopleId, year);
    },

    /**
     * Obtiene estadísticas de entregas
     */
    async getDeliveryStats(year, period = null) {
        return await DotacionDelivery.getDeliveryStats(year, period);
    }
};

module.exports = DotacionDeliveryService;
