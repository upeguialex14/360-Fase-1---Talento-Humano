/**
 * Modelo de Configuración de Alertas de Stock
 * Define el umbral mínimo para cada artículo y el correo (opcional) para notificar.
 */
const pool = require('../../config/db');

const DotacionAlertConfig = {
    async getAll() {
        const [rows] = await pool.query(`
            SELECT article_id, min_quantity, email_to
            FROM DOTACION_ALERT_CONFIG`
        );
        return rows;
    },
    async getByArticle(articleId) {
        const [rows] = await pool.execute(`
            SELECT article_id, min_quantity, email_to
            FROM DOTACION_ALERT_CONFIG WHERE article_id = ?`,
            [articleId]
        );
        return rows[0] || null;
    },
    async upsert({ article_id, min_quantity, email_to }) {
        // Insert o update (ON DUPLICATE KEY)
        const [result] = await pool.execute(`
            INSERT INTO DOTACION_ALERT_CONFIG (article_id, min_quantity, email_to)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE min_quantity = VALUES(min_quantity), email_to = VALUES(email_to)
        `, [article_id, min_quantity, email_to]);
        return result.affectedRows > 0;
    }
};

module.exports = DotacionAlertConfig;
