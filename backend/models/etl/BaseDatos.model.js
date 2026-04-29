const db = require('../../config/db');

const getAll = async () => {
    try {
        const sql = `SELECT * FROM base_datos_maestra ORDER BY id DESC`;
        const [rows] = await db.query(sql);
        return rows;
    } catch (error) {
        throw error;
    }
};

module.exports = { getAll };
