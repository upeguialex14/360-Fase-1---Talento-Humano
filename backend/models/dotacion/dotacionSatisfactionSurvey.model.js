/**
 * Modelo de Encuesta de Satisfacción de Dotación
 */
const pool = require('../../config/db');

const DotacionSatisfactionSurvey = {
    async getAll() {
        const [rows] = await pool.query(`
            SELECT dss.*, p.cedula, CONCAT(p.name, ' ', p.last_name) as person_name
            FROM DOTACION_SATISFACTION_SURVEY dss
            JOIN PEOPLE p ON dss.people_id = p.people_id
            ORDER BY dss.submitted_at DESC`
        );
        return rows;
    },

    async create(data) {
        const { people_id, period_year, fabric_rating, zipper_rating, comfort_rating, overall_rating, comments } = data;
        
        const [result] = await pool.execute(`
            INSERT INTO DOTACION_SATISFACTION_SURVEY 
                (people_id, period_year, fabric_rating, zipper_rating, comfort_rating, overall_rating, comments)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [people_id, period_year, fabric_rating, zipper_rating, comfort_rating, overall_rating, comments]
        );
        return result.insertId;
    },

    async getStatsByYear(year) {
        const [rows] = await pool.execute(`
            SELECT 
                AVG(fabric_rating) as avg_fabric,
                AVG(zipper_rating) as avg_zipper,
                AVG(comfort_rating) as avg_comfort,
                AVG(overall_rating) as avg_overall,
                COUNT(*) as total_responses
            FROM DOTACION_SATISFACTION_SURVEY
            WHERE period_year = ?`,
            [year]
        );
        return rows[0];
    }
};

module.exports = DotacionSatisfactionSurvey;
