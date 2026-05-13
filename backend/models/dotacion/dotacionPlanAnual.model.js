/**
 * Modelo de DOTACION_PLAN_ANUAL
 * Plan anual de dotación creado por un líder en Enero/Febrero
 */
const pool = require('../../config/db');

const DotacionPlanAnual = {

    async getAll(filters = {}) {
        let where = ['1=1'];
        let params = [];

        if (filters.year) { where.push('dpa.plan_year = ?'); params.push(filters.year); }
        if (filters.leader_id) { where.push('dpa.leader_id = ?'); params.push(filters.leader_id); }
        if (filters.status_id) { where.push('dpa.status_id = ?'); params.push(filters.status_id); }
        if (filters.unit_id) { where.push('dpa.unit_id = ?'); params.push(filters.unit_id); }

        const [rows] = await pool.query(`
            SELECT 
                dpa.plan_id,
                dpa.plan_year,
                dpa.leader_id,
                CONCAT(u.name, ' ', u.last_name) as leader_name,
                dpa.unit_id,
                mu.name as unit_name,
                dpa.status_id,
                mse.status_endowment as status_name,
                dpa.total_people,
                dpa.observations,
                dpa.created_at,
                dpa.updated_at,
                (SELECT COUNT(*) FROM DOTACION_PLAN_PERSONA dpp 
                 WHERE dpp.plan_id = dpa.plan_id AND dpp.status = 'INCLUIDO') as active_count,
                (SELECT COUNT(*) FROM DOTACION_PLAN_PERSONA dpp 
                 WHERE dpp.plan_id = dpa.plan_id AND dpp.status = 'RETIRADO') as retired_count
            FROM DOTACION_PLAN_ANUAL dpa
            LEFT JOIN USERS u ON dpa.leader_id = u.user_id
            LEFT JOIN MASTER_UNIT mu ON dpa.unit_id = mu.unit_id
            LEFT JOIN MASTER_STATUS_ENDOWMENT mse ON dpa.status_id = mse.status_id
            WHERE ${where.join(' AND ')}
            ORDER BY dpa.plan_year DESC, dpa.created_at DESC
        `, params);
        return rows;
    },

    async getById(planId) {
        const [rows] = await pool.execute(`
            SELECT 
                dpa.plan_id,
                dpa.plan_year,
                dpa.leader_id,
                CONCAT(u.name, ' ', u.last_name) as leader_name,
                u.email as leader_email,
                dpa.unit_id,
                mu.name as unit_name,
                dpa.status_id,
                mse.status_endowment as status_name,
                dpa.total_people,
                dpa.observations,
                dpa.created_at,
                dpa.updated_at
            FROM DOTACION_PLAN_ANUAL dpa
            LEFT JOIN USERS u ON dpa.leader_id = u.user_id
            LEFT JOIN MASTER_UNIT mu ON dpa.unit_id = mu.unit_id
            LEFT JOIN MASTER_STATUS_ENDOWMENT mse ON dpa.status_id = mse.status_id
            WHERE dpa.plan_id = ?
        `, [planId]);
        return rows[0] || null;
    },

    async create({ plan_year, leader_id, unit_id, observations }) {
        const [result] = await pool.execute(
            `INSERT INTO DOTACION_PLAN_ANUAL 
                (plan_year, leader_id, unit_id, observations, status_id)
             VALUES (?, ?, ?, ?, 1)`,
            [plan_year, leader_id, unit_id || null, observations || null]
        );
        return result.insertId;
    },

    async updateStatus(planId, statusId) {
        const [result] = await pool.execute(
            `UPDATE DOTACION_PLAN_ANUAL SET status_id = ? WHERE plan_id = ?`,
            [statusId, planId]
        );
        return result.affectedRows > 0;
    },

    async updateTotalPeople(planId) {
        const [result] = await pool.execute(
            `UPDATE DOTACION_PLAN_ANUAL 
             SET total_people = (
                 SELECT COUNT(*) FROM DOTACION_PLAN_PERSONA 
                 WHERE plan_id = ? AND status = 'INCLUIDO'
             )
             WHERE plan_id = ?`,
            [planId, planId]
        );
        return result.affectedRows > 0;
    },

    async getByLeader(leaderId, year) {
        const [rows] = await pool.execute(`
            SELECT dpa.*, mse.status_endowment as status_name
            FROM DOTACION_PLAN_ANUAL dpa
            LEFT JOIN MASTER_STATUS_ENDOWMENT mse ON dpa.status_id = mse.status_id
            WHERE dpa.leader_id = ? AND dpa.plan_year = ?
        `, [leaderId, year]);
        return rows;
    },

    async exists(leaderId, year) {
        const [rows] = await pool.execute(
            `SELECT plan_id FROM DOTACION_PLAN_ANUAL 
             WHERE leader_id = ? AND plan_year = ?`,
            [leaderId, year]
        );
        return rows.length > 0 ? rows[0].plan_id : null;
    }
};

module.exports = DotacionPlanAnual;
