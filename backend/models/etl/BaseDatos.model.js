const db = require('../../config/db');

const getAll = async () => {
    try {
        const sql = `SELECT *, extended_info_id as id FROM people_extended_info ORDER BY extended_info_id DESC`;
        const [rows] = await db.query(sql);
        return rows;
    } catch (error) {
        throw error;
    }
};

module.exports = { getAll };
