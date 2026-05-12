/**
 * Modelo de DOTACION_PLAN_PERSONA
 * Personas incluidas en un plan anual de dotación
 * Estados: INCLUIDO, RETIRADO, ROTADO
 */
const pool = require('../../config/db');

const DotacionPlanPersona = {

    async getByPlan(planId) {
        const [rows] = await pool.execute(`
            SELECT 
                dpp.plan_persona_id,
                dpp.plan_id,
                dpp.people_id,
                dpp.unit_id_at_plan,
                mu_plan.name as unit_at_plan_name,
                dpp.is_day_one,
                dpp.status,
                dpp.notes,
                dpp.created_at,
                
                p.document_number as cedula,
                CONCAT(p.first_name, ' ', p.last_name) as nombre_completo,
                p.email,
                
                bpd.unit_id as current_unit_id,
                mu_current.name as current_unit_name,
                bpd.start_date as fecha_ingreso,
                DATEDIFF(CURDATE(), bpd.start_date) as dias_antiguedad,
                bpd.client_id,
                mc.name as cliente,
                
                pd.size_shirt as t_camisa,
                pd.size_jean as t_pantalon,
                pd.size_shoes as t_zapatos,
                pd.size_jacket as t_chaqueta,
                pd.size_vest as t_chaleco
                
            FROM DOTACION_PLAN_PERSONA dpp
            JOIN PEOPLE p ON dpp.people_id = p.people_id
            LEFT JOIN BUSINESS_PEOPLE_DATA bpd ON p.people_business_id = bpd.people_business_id
            LEFT JOIN MASTER_UNIT mu_plan ON dpp.unit_id_at_plan = mu_plan.unit_id
            LEFT JOIN MASTER_UNIT mu_current ON bpd.unit_id = mu_current.unit_id
            LEFT JOIN MASTER_CLIENT mc ON bpd.client_id = mc.client_id
            LEFT JOIN PEOPLE_DETAILS pd ON p.details_id = pd.details_id
            WHERE dpp.plan_id = ?
            ORDER BY dpp.status, p.last_name, p.first_name
        `, [planId]);
        return rows;
    },

    async addPerson(planId, peopleId, { unit_id_at_plan, is_day_one = 0, notes } = {}) {
        const [result] = await pool.execute(
            `INSERT INTO DOTACION_PLAN_PERSONA 
                (plan_id, people_id, unit_id_at_plan, is_day_one, notes)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                status = 'INCLUIDO',
                unit_id_at_plan = VALUES(unit_id_at_plan),
                is_day_one = VALUES(is_day_one),
                notes = VALUES(notes)`,
            [planId, peopleId, unit_id_at_plan || null, is_day_one, notes || null]
        );
        return result.insertId || result.affectedRows;
    },

    async addBulk(planId, people) {
        if (!people || people.length === 0) return 0;

        let inserted = 0;
        for (const person of people) {
            try {
                await pool.execute(
                    `INSERT IGNORE INTO DOTACION_PLAN_PERSONA 
                        (plan_id, people_id, unit_id_at_plan, is_day_one)
                     VALUES (?, ?, ?, ?)`,
                    [planId, person.people_id, person.unit_id || null, person.is_day_one || 0]
                );
                inserted++;
            } catch (e) {
                console.warn(`[DOTACION] No se pudo agregar persona ${person.people_id} al plan:`, e.message);
            }
        }
        return inserted;
    },

    async updateStatus(planPersonaId, status, notes = null) {
        const validStatuses = ['INCLUIDO', 'RETIRADO', 'ROTADO'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Estado inválido: ${status}. Válidos: ${validStatuses.join(', ')}`);
        }

        const [result] = await pool.execute(
            `UPDATE DOTACION_PLAN_PERSONA SET status = ?, notes = COALESCE(?, notes) WHERE plan_persona_id = ?`,
            [status, notes, planPersonaId]
        );
        return result.affectedRows > 0;
    },

    async markRetired(peopleId, planYear) {
        // Marca como RETIRADO en todos los planes del año
        const [result] = await pool.execute(
            `UPDATE DOTACION_PLAN_PERSONA dpp
             JOIN DOTACION_PLAN_ANUAL dpa ON dpp.plan_id = dpa.plan_id
             SET dpp.status = 'RETIRADO', dpp.notes = 'Retiro automático por baja'
             WHERE dpp.people_id = ? AND dpa.plan_year = ? AND dpp.status = 'INCLUIDO'`,
            [peopleId, planYear]
        );
        return result.affectedRows;
    },

    async markRotated(peopleId, planId, newUnitId) {
        // Marca como ROTADO y crea nueva entrada con la unidad nueva
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Marcar la entrada actual como ROTADO
            await connection.execute(
                `UPDATE DOTACION_PLAN_PERSONA 
                 SET status = 'ROTADO', notes = CONCAT('Rotado a unidad ', ?)
                 WHERE plan_id = ? AND people_id = ? AND status = 'INCLUIDO'`,
                [newUnitId, planId, peopleId]
            );

            // Crear nueva entrada con la unidad actualizada
            await connection.execute(
                `INSERT INTO DOTACION_PLAN_PERSONA 
                    (plan_id, people_id, unit_id_at_plan, status, notes)
                 VALUES (?, ?, ?, 'INCLUIDO', 'Ingreso por rotación de unidad')
                 ON DUPLICATE KEY UPDATE
                    unit_id_at_plan = VALUES(unit_id_at_plan),
                    status = 'INCLUIDO',
                    notes = VALUES(notes)`,
                [planId, peopleId, newUnitId]
            );

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async removePerson(planPersonaId) {
        const [result] = await pool.execute(
            `DELETE FROM DOTACION_PLAN_PERSONA WHERE plan_persona_id = ?`,
            [planPersonaId]
        );
        return result.affectedRows > 0;
    },

    async getByPeopleAndYear(peopleId, year) {
        const [rows] = await pool.execute(`
            SELECT dpp.*, dpa.plan_year, dpa.leader_id
            FROM DOTACION_PLAN_PERSONA dpp
            JOIN DOTACION_PLAN_ANUAL dpa ON dpp.plan_id = dpa.plan_id
            WHERE dpp.people_id = ? AND dpa.plan_year = ? AND dpp.status = 'INCLUIDO'
        `, [peopleId, year]);
        return rows;
    }
};

module.exports = DotacionPlanPersona;
