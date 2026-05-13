/**
 * Servicio de Elegibilidad de Dotación
 * 
 * Reglas de negocio:
 * - Empleado activo (status_id = 1 en BUSINESS_PEOPLE_DATA)
 * - Antigüedad ≥ 120 días (4 meses) desde fecha de ingreso
 * - EXCEPCIÓN: Si el cliente requiere día-1 (DOTACION_CLIENT_CONFIG.requires_day_one = 1)
 * - No debe tener entrega registrada para el mismo período
 * - La unidad determina qué prendas recibe (DOTACION_UNIT_ITEM)
 */
const pool = require('../../config/db');
const DotacionClientConfig = require('../../models/dotacion/dotacionClientConfig.model');

const DotacionEligibility = {

    /**
     * Obtiene la lista de personas elegibles para dotación en un período específico
     * @param {number} periodYear - Año (ej: 2026)
     * @param {number} periodNumber - Período (1=Abril, 2=Agosto, 3=Nov-Dic)
     * @returns {Array} Lista de personas elegibles con sus datos y tallas
     */
    async getEligiblePeople(periodYear, periodNumber) {
        // 1. Obtener clientes con excepción día-1
        const dayOneClientIds = await DotacionClientConfig.getDayOneClients();
        const dayOnePlaceholders = dayOneClientIds.length > 0
            ? dayOneClientIds.map(() => '?').join(', ')
            : '0'; // Si no hay excepciones, usar 0 para que no matchee

        // 2. Query principal de elegibilidad
        const query = `
            SELECT 
                p.people_id,
                p.document_number as cedula,
                CONCAT(p.first_name, ' ', p.last_name) as nombre_completo,
                p.email,
                
                bpd.start_date as fecha_ingreso,
                DATEDIFF(CURDATE(), bpd.start_date) as dias_antiguedad,
                bpd.unit_id,
                mu.name as unidad,
                bpd.client_id,
                mc.name as cliente,
                bpd.office_id,
                mo.name as oficina,
                
                pd.size_shirt as t_camisa,
                pd.size_jean as t_pantalon,
                pd.size_shoes as t_zapatos,
                pd.size_jacket as t_chaqueta,
                pd.size_vest as t_chaleco,
                
                CASE 
                    WHEN bpd.client_id IN (${dayOnePlaceholders}) THEN 1
                    ELSE 0
                END as is_day_one,
                
                CASE 
                    WHEN bpd.client_id IN (${dayOnePlaceholders}) THEN 'Excepción día-1 por cliente'
                    WHEN DATEDIFF(CURDATE(), bpd.start_date) >= 120 THEN 'Antigüedad >= 4 meses'
                    ELSE 'No elegible'
                END as razon_elegibilidad
                
            FROM PEOPLE p
            JOIN BUSINESS_PEOPLE_DATA bpd ON p.people_business_id = bpd.people_business_id
            LEFT JOIN MASTER_UNIT mu ON bpd.unit_id = mu.unit_id
            LEFT JOIN MASTER_CLIENT mc ON bpd.client_id = mc.client_id
            LEFT JOIN MASTER_OFFICES mo ON bpd.office_id = mo.office_id
            LEFT JOIN PEOPLE_DETAILS pd ON p.details_id = pd.details_id
            
            WHERE bpd.status_id = 1
              AND bpd.termination_date IS NULL
              AND (
                  DATEDIFF(CURDATE(), bpd.start_date) >= 120
                  OR bpd.client_id IN (${dayOnePlaceholders})
              )
              AND p.people_id NOT IN (
                  SELECT dd.people_id 
                  FROM DOTACION_DELIVERY dd
                  WHERE dd.period_year = ?
                    AND dd.period_number = ?
                    AND dd.status_id NOT IN (
                        SELECT status_id FROM MASTER_STATUS_ENDOWMENT 
                        WHERE status_endowment IN ('Rechazado', 'Cancelado')
                    )
              )
            ORDER BY mu.name, p.last_name, p.first_name
        `;

        // Construir parámetros: dayOneIds se repiten 3 veces en el query (3 usos del IN)
        const params = [
            ...dayOneClientIds,    // Primer IN (CASE is_day_one)
            ...dayOneClientIds,    // Segundo IN (CASE razon)
            ...dayOneClientIds,    // Tercer IN (WHERE OR)
            periodYear,
            periodNumber
        ];

        const [rows] = await pool.execute(query, params);
        return rows;
    },

    /**
     * Verifica si una persona específica es elegible para dotación
     * @param {number} peopleId - ID de la persona
     * @param {number} periodYear - Año
     * @param {number} periodNumber - Período
     * @returns {Object} { eligible: boolean, reason: string, data: Object }
     */
    async checkEligibility(peopleId, periodYear, periodNumber) {
        // Verificar datos básicos de la persona
        const [personRows] = await pool.execute(`
            SELECT 
                p.people_id,
                p.document_number,
                CONCAT(p.first_name, ' ', p.last_name) as nombre,
                bpd.start_date,
                DATEDIFF(CURDATE(), bpd.start_date) as dias_antiguedad,
                bpd.unit_id,
                bpd.client_id,
                bpd.status_id,
                bpd.termination_date
            FROM PEOPLE p
            JOIN BUSINESS_PEOPLE_DATA bpd ON p.people_business_id = bpd.people_business_id
            WHERE p.people_id = ?
        `, [peopleId]);

        if (personRows.length === 0) {
            return { eligible: false, reason: 'Persona no encontrada', data: null };
        }

        const person = personRows[0];

        // Verificar estado activo
        if (person.status_id !== 1 || person.termination_date) {
            return { eligible: false, reason: 'Persona no está activa o tiene fecha de retiro', data: person };
        }

        // Verificar si ya tiene entrega en este período
        const [existingDelivery] = await pool.execute(`
            SELECT delivery_id, status_id 
            FROM DOTACION_DELIVERY 
            WHERE people_id = ? AND period_year = ? AND period_number = ?
              AND status_id NOT IN (
                  SELECT status_id FROM MASTER_STATUS_ENDOWMENT 
                  WHERE status_endowment IN ('Rechazado', 'Cancelado')
              )
        `, [peopleId, periodYear, periodNumber]);

        if (existingDelivery.length > 0) {
            return { eligible: false, reason: 'Ya tiene entrega registrada para este período', data: person };
        }

        // Verificar excepción día-1
        const dayOneClients = await DotacionClientConfig.getDayOneClients();
        if (dayOneClients.includes(person.client_id)) {
            return { eligible: true, reason: 'Excepción día-1 por cliente', data: person };
        }

        // Verificar antigüedad
        if (person.dias_antiguedad >= 120) {
            return { eligible: true, reason: 'Antigüedad >= 4 meses', data: person };
        }

        return { eligible: false, reason: `Antigüedad insuficiente: ${person.dias_antiguedad} días (requiere 120)`, data: person };
    },

    /**
     * Obtiene estadísticas de elegibilidad para el dashboard
     */
    async getStats(periodYear, periodNumber) {
        const eligible = await this.getEligiblePeople(periodYear, periodNumber);

        // Contar entregas ya realizadas en este período
        const [delivered] = await pool.execute(`
            SELECT COUNT(*) as total
            FROM DOTACION_DELIVERY
            WHERE period_year = ? AND period_number = ?
              AND status_id IN (
                  SELECT status_id FROM MASTER_STATUS_ENDOWMENT 
                  WHERE status_endowment IN ('Entregado', 'Firmado', 'Recibido')
               )
        `, [periodYear, periodNumber]);

        // Contar firmas pendientes (Enviado para Firma)
        const [pendingSign] = await pool.execute(`
            SELECT COUNT(*) as total
            FROM DOTACION_DELIVERY
            WHERE period_year = ? AND period_number = ?
              AND status_id IN (
                  SELECT status_id FROM MASTER_STATUS_ENDOWMENT 
                  WHERE status_endowment IN ('Enviado para Firma')
              )
        `, [periodYear, periodNumber]);

        // Contar total de empleados activos
        const [totalActive] = await pool.query(`
            SELECT COUNT(*) as total
            FROM PEOPLE p
            JOIN BUSINESS_PEOPLE_DATA bpd ON p.people_business_id = bpd.people_business_id
            WHERE bpd.status_id = 1 AND bpd.termination_date IS NULL
        `);

        // Determinar próximo periodo
        let nextPeriod = { year: periodYear, number: periodNumber + 1 };
        if (nextPeriod.number > 3) {
            nextPeriod.year++;
            nextPeriod.number = 1;
        }

        const periodNames = { 1: 'Abril', 2: 'Agosto', 3: 'Diciembre' };

        return {
            period: { 
                year: periodYear, 
                number: periodNumber,
                name: periodNames[periodNumber] || 'Extraordinaria'
            },
            next_period: {
                year: nextPeriod.year,
                name: periodNames[nextPeriod.number] || 'Abril'
            },
            total_active_employees: totalActive[0].total,
            total_eligible: eligible.length,
            total_delivered: delivered[0].total,
            total_pending_signature: pendingSign[0].total,
            eligible_by_unit: eligible.reduce((acc, p) => {
                const unit = p.unidad || 'Sin unidad';
                acc[unit] = (acc[unit] || 0) + 1;
                return acc;
            }, {})
        };
    }
};

module.exports = DotacionEligibility;
