/**
 * Servicio de Plan Anual de Dotación
 * 
 * Lógica:
 * - Líder crea plan en Ene/Feb para todo el año
 * - Sistema calcula elegibles y los incluye automáticamente
 * - Manejo de retiros (devuelve stock, cancela entregas pendientes)
 * - Manejo de rotaciones (cambia unidad, próximas entregas usan nueva unidad)
 */
const DotacionPlanAnual = require('../../models/dotacion/dotacionPlanAnual.model');
const DotacionPlanPersona = require('../../models/dotacion/dotacionPlanPersona.model');
const DotacionDelivery = require('../../models/dotacion/dotacionDelivery.model');
const DotacionInventory = require('../../models/dotacion/dotacionInventory.model');
const DotacionEligibility = require('./dotacionEligibility.service');

const DotacionPlanService = {

    /**
     * Crea un plan anual con las personas elegibles incluidas automáticamente
     */
    async createPlanWithEligible(leaderId, unitId, year, observations = null) {
        // 1. Verificar que no exista plan duplicado
        const existingPlanId = await DotacionPlanAnual.exists(leaderId, year);
        if (existingPlanId) {
            return {
                success: false,
                message: `Ya existe un plan para este líder en el año ${year} (plan_id: ${existingPlanId})`,
                existing_plan_id: existingPlanId
            };
        }

        // 2. Obtener personas elegibles (período 1 como referencia)
        const allEligible = await DotacionEligibility.getEligiblePeople(year, 1);

        // 3. Filtrar por unidad del líder si se especifica
        let eligible = allEligible;
        if (unitId) {
            eligible = allEligible.filter(p => p.unit_id === parseInt(unitId));
        }

        // 4. Crear el plan
        const planId = await DotacionPlanAnual.create({
            plan_year: year,
            leader_id: leaderId,
            unit_id: unitId,
            observations
        });

        // 5. Agregar personas elegibles al plan
        const people = eligible.map(p => ({
            people_id: p.people_id,
            unit_id: p.unit_id,
            is_day_one: p.is_day_one
        }));

        const inserted = await DotacionPlanPersona.addBulk(planId, people);

        // 6. Actualizar conteo
        await DotacionPlanAnual.updateTotalPeople(planId);

        console.log(`[DOTACION] Plan ${planId} creado: ${inserted} personas de ${eligible.length} elegibles`);

        return {
            success: true,
            plan_id: planId,
            year,
            leader_id: leaderId,
            unit_id: unitId,
            total_eligible: eligible.length,
            total_included: inserted
        };
    },

    /**
     * Obtiene planes con filtros
     */
    async getPlans(filters = {}) {
        return await DotacionPlanAnual.getAll(filters);
    },

    /**
     * Obtiene un plan con sus personas
     */
    async getPlanWithPeople(planId) {
        const plan = await DotacionPlanAnual.getById(planId);
        if (!plan) return null;

        const people = await DotacionPlanPersona.getByPlan(planId);

        return {
            ...plan,
            people,
            summary: {
                total: people.length,
                incluidos: people.filter(p => p.status === 'INCLUIDO').length,
                retirados: people.filter(p => p.status === 'RETIRADO').length,
                rotados: people.filter(p => p.status === 'ROTADO').length
            }
        };
    },

    /**
     * Agrega una persona manualmente a un plan existente
     */
    async addPersonToPlan(planId, peopleId, data = {}) {
        const plan = await DotacionPlanAnual.getById(planId);
        if (!plan) throw new Error('Plan no encontrado');

        await DotacionPlanPersona.addPerson(planId, peopleId, data);
        await DotacionPlanAnual.updateTotalPeople(planId);

        return { success: true, message: 'Persona agregada al plan' };
    },

    /**
     * Maneja el retiro de un empleado
     * 1. Marca como RETIRADO en planes del año
     * 2. Cancela entregas pendientes
     * 3. Libera stock reservado
     */
    async handleRetirement(peopleId, year = null) {
        const currentYear = year || new Date().getFullYear();

        // 1. Marcar como RETIRADO en planes
        const plansAffected = await DotacionPlanPersona.markRetired(peopleId, currentYear);

        // 2. Cancelar entregas pendientes y obtener los detalles para liberar stock
        const cancelledDeliveries = await DotacionDelivery.cancelPendingByPerson(peopleId, currentYear);

        // 3. Actualizar conteos de planes afectados
        const plans = await DotacionPlanPersona.getByPeopleAndYear(peopleId, currentYear);
        for (const plan of plans) {
            await DotacionPlanAnual.updateTotalPeople(plan.plan_id);
        }

        console.log(`[DOTACION] Retiro procesado para persona ${peopleId}: ${plansAffected} planes, ${cancelledDeliveries} entregas canceladas`);

        return {
            success: true,
            people_id: peopleId,
            year: currentYear,
            plans_affected: plansAffected,
            deliveries_cancelled: cancelledDeliveries
        };
    },

    /**
     * Maneja la rotación de unidad de un empleado
     * 1. Marca como ROTADO en el plan actual
     * 2. Crea nueva entrada con la unidad nueva
     * 3. Las próximas entregas usarán la nueva unidad
     */
    async handleRotation(peopleId, planId, newUnitId) {
        await DotacionPlanPersona.markRotated(peopleId, planId, newUnitId);

        console.log(`[DOTACION] Rotación procesada: persona ${peopleId} → unidad ${newUnitId}`);

        return {
            success: true,
            people_id: peopleId,
            plan_id: planId,
            new_unit_id: newUnitId,
            message: 'Rotación registrada. Las próximas entregas usarán la nueva unidad.'
        };
    },

    /**
     * Actualiza el estado de un plan
     */
    async updatePlanStatus(planId, statusId) {
        const updated = await DotacionPlanAnual.updateStatus(planId, statusId);
        if (!updated) throw new Error('Plan no encontrado');
        return { success: true, message: 'Estado del plan actualizado' };
    }
};

module.exports = DotacionPlanService;
